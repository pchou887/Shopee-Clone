import { Request, Response, NextFunction } from "express";
import { fileTypeFromBuffer } from "file-type";
import * as s3Model from "../models/s3.js";

const generateImages = (files: {
  [fieldname: string]: Express.Multer.File[];
}) => {
  const images = Object.values(files).reduce(
    (acc: Express.Multer.File[], value) => {
      if (Array.isArray(value)) {
        acc.push(...value);
      }
      return acc;
    },
    []
  );
  return images;
};
const isFilesObject = (
  object: any
): object is {
  [fieldname: string]: Express.Multer.File[];
} => {
  return (
    typeof object === "object" && Object.values(object).every(Array.isArray)
  );
};

const isFileObject = (
  object: any
): object is {
  [fieldname: string]: Express.Multer.File;
} => {
  return typeof object === "object";
};

export const checkFileType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isFilesObject(req.files)) {
    const images = await Promise.all(
      generateImages(req.files).map(async (file) => {
        const fileType = await fileTypeFromBuffer(file.buffer);
        return { ...file, ...fileType };
      })
    );
    images.forEach((image) => {
      if (image.mime !== image.mimetype) {
        throw new Error("fake type");
      }
    });
    res.locals.images = images;
  }
  if (isFileObject(req.file)) {
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    const image = { ...req.file, ...fileType };
    if (image.mime !== image.mimetype) {
      throw new Error("fake type");
    }
    res.locals.image = image;
  }
  next();
};

export const saveProductImagesToS3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (Array.isArray(res.locals.images) && res.locals.images.length > 0) {
      const images = await s3Model.uploadProductImageToS3(res.locals.images);
      res.locals.images = images;
    }
    next();
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "save images failed" });
  }
};
