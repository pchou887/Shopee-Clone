import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { FileTypeResult } from "file-type";

dotenv.config();

const bucketName: string = process.env.BUCKET_NAME || "";
const bucketRegion: string = process.env.BUCKET_REGION || "";
const accessKey: string = process.env.ACCESS_KEY || "";
const secretAccessKey: string = process.env.SECRET_ACCESS_KEY || "";

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

type image = Express.Multer.File & FileTypeResult;

export const uploadProductImageToS3 = async (images: image[]) => {
  const date = new Date().toJSON();
  const filedname = date.replace(/-|[A-Z]|\:|\./g, "");
  const params = images.map((image, index) => ({
    Bucket: bucketName,
    Key:
      index === 0
        ? `upload/${filedname}/main`
        : `upload/${filedname}/${index - 1}`,
    Body: image.buffer,
    ContentType: image.mimetype,
  }));
  const commands = params.map((ele) => new PutObjectCommand(ele));
  await Promise.all(commands.map((ele) => s3.send(ele)));
  const imageResults = images.map((ele, index) => ({
    ...ele,
    path: params[index].Key,
    type: index === 0 ? "main_image" : "image",
  }));

  return imageResults;
};

export const uploadUserImageToS3 = async (image: image, userId: number) => {
  const params = {
    Bucket: bucketName,
    Key: `userImage/${userId}`,
    Body: image.buffer,
    ContentType: image.mimetype,
  };
  const commands = new PutObjectCommand(params);
  await s3.send(commands);
};
