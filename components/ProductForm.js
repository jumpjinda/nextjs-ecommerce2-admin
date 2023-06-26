import axios from "axios";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import Spinner from "./Spinner";
import {ReactSortable} from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(
    existingDescription || ""
  );
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  // console.log({ _id });

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(e) {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };

    if (_id) {
      // send PUT method request to update product
      // {...data , id} <===== these are req.body
      await axios.put("/api/products", {
        ...data,
        _id,
      });
    } else {
      // send POST method request to create product
      // data <=== this is req.body
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push("/products");
  }

  async function uploadImages(e) {
    // console.log(e);
    const files = e.target.files;
    // console.log(files);

    if (files?.length > 0) {
      setIsUploading(true);
      // create Array FormData and assign to data
      const data = new FormData();
      // append file in files array to data
      for (const file of files) {
        data.append("file", file);
      }
      // send post method and data to upload api
      const res = await axios.post("/api/upload", data);
      // console.log(res);
      // console.log(res.data);
      setImages((oldImages) => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  }

  function updateImagesOrder(images) {
    // console.log(arguments);
    setImages(images);
  }

  function removeImage(indexToRemove) {
    setImages((prev) => {
      return [...prev].filter((image, imageIndex) => {
        return imageIndex !== indexToRemove;
      });
    });
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = {
        ...prev,
      };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  // Show properties from category or parent category when creating product
  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({_id}) => _id === category);
    // console.log({selCatInfo});
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({_id}) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCat.properties);
      // Prevent infinite loop
      catInfo = parentCat;
    }
  }

  // console.log(category);
  // console.log(images);

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="mt-2">
        <label>Category</label>
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((item) => (
            <option
              value={item._id}
              key={item._id}
            >
              {item.name}
            </option>
          ))}
      </select>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p, pIndex) => (
          <div
            key={pIndex}
            className="flex gap-1 mt-2 items-center"
          >
            <label className="w-48 pl-5">{p.name[0].toUpperCase() + p.name.substring(1)} :</label>
            <select
              value={productProperties[p.name]}
              onChange={(e) => setProductProp(p.name, e.target.value)}
            >
              {p.values.map((v, vIndex) => (
                <option
                  key={vIndex}
                  value={v}
                >
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}

      <div className="mt-2">
        <label>Photos</label>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex flex-wrap gap-2"
        >
          {!!images?.length &&
            images.map((link, index) => (
              <div
                key={link}
                className="relative h-24 bg-white border border-gray-200 shadow-md"
              >
                <img
                  src={link}
                  className="rounded-md"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2"
                  onClick={() => removeImage(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="w-6 h-6">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className=" inline-block w-24 h-24 border flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-md cursor-pointer shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          Upload
          <input
            type="file"
            onChange={uploadImages}
            className="hidden"
          />
        </label>
      </div>

      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <button className="btn-primary mt-2">Save</button>
    </form>
  );
}
