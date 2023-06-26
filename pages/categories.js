import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Categories() {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }

  async function saveCategory(e) {
    e.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    // console.log(parentCategory);

    // Check if editedCategory has object inside, we will run PUT method (Edit mode)
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  // console.log({ name });

  // When onClink call a function, this function will received whole category object and set it to editedCategory so we can use it.
  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      // values is object when we editing values we will get error, so we convert values to string then we can edit it.
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  function deleteCategory(category) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${category.name}" category?`,
      icon: "error",
      confirmButtonText: "Yes, Delete!",
      confirmButtonColor: "#d55",
      showCancelButton: true,
      cancelButtonText: "No, I've changed my mind",
      reverseButtons: true,
    }).then(async (result) => {
      // console.log(result);
      if (result.isConfirmed) {
        const { _id } = category;
        await axios.delete("/api/categories?_id=" + _id);
        fetchCategories();
      }
    });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    // console.log({ index, property, newName });
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
    // console.log({ property });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    // console.log({ index, property, newName });
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
    // console.log({ property });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {/* We use name argument in editedCategory here!!
         */}
        {editedCategory
          ? `Edit "${editedCategory.name}" category`
          : "New category name"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option
                  value={category._id}
                  key={category._id}
                >
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="my-2">
          <label className="block">Properties</label>
          <button
            className="btn-primary text-sm mt-1"
            type="button"
            onClick={addProperty}
          >
            Add new property
          </button>
        </div>

        <div className="mb-2">
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div
                className="flex gap-1 mt-1"
                key={index}
              >
                <input
                  type="text"
                  placeholder="property name (example: color)"
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyNameChange(index, property, e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="values, comma separated"
                  value={property.values}
                  onChange={(e) =>
                    handlePropertyValuesChange(index, property, e.target.value)
                  }
                />
                <button
                  type="button"
                  className="btn-red"
                  onClick={() => removeProperty(index)}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>

        <div className="flex gap-1">
          <button
            type="submit"
            className="btn-primary"
          >
            Save
          </button>

          {/* Show cancel button in edit mode */}
          {editedCategory && (
            <button
              type="button"
              className="btn-default"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Hide table when enter edit mode */}
      {!editedCategory && (
        <table className="basic mt-5">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              {/* create empty head column for delete button in row*/}
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td className="flex justify-center">
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-primary mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
