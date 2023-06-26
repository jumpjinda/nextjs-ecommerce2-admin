import multiparty from "multiparty";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
// import file system library to read images file
import fs from "fs";
// read file type library
import mime from "mime-types";
import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "./auth/[...nextauth]";

const bucketName = "nextjs-ecommerce2";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);
  const from = new multiparty.Form();
  const {fields, files} = await new Promise((resolve, reject) => {
    from.parse(req, (err, fields, files) => {
      if (err) throw err;
      resolve({fields, files});
    });
  });
  // console.log("length", files.file.length);
  // console.log(fields);
  const client = new S3Client({
    region: "ap-southeast-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const links = [];

  for (const file of files.file) {
    const ext = file.originalFilename.split(".").pop();
    // console.log({ ext, file });
    const newFilename = Date.now() + "." + ext;

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        Body: fs.readFileSync(file.path),
        ACL: "public-read",
        ContentType: mime.lookup(file.path),
      })
    );
    // grab image link from s3
    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;

    // push all link to links[]
    links.push(link);
  }
  return res.json({links});
}

export const config = {
  api: {bodyParser: false},
};
