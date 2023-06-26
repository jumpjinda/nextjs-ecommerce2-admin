import {mongooseConnect} from "@/lib/mongoose";
import {Product} from "@/models/Product";
import {isAdminRequest} from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Product.findOne({_id: req.query.id}));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === "POST") {
    const {title, description, price, images, category, properties} =
      req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      // if creating product with no category, we add undefined instead
      category: category || null,
      properties
    });
    res.json(productDoc);
  }

  if (method === "PUT") {
    const {title, description, price, _id, images, category, properties} =
      req.body;
    // console.log(images);
    await Product.updateOne(
      {_id},
      // if updating product with no category, we add undefined instead
      {
        title,
        description,
        price,
        images,
        category: category || null,
        properties
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Product.deleteOne({_id: req.query?.id});
      res.json(true);
    }
  }
}
