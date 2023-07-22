import { Request, Response } from "express";
import * as productModel from "../models/product.js";
import * as productImageModel from "../models/productImage.js";
import * as productVariantModel from "../models/productVariant.js";
import * as redisModel from "../models/redis.js";

const mapId = <Item extends { id: number }>(item: Item) => {
  return item.id;
};

const mapImages = (imagesObj: {
  [productId: string]: { main_image: string; images: string[] };
}) => {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    main_image:
      `https://d1a26cbu5iquck.cloudfront.net/${
        imagesObj[product.id]?.main_image
      }` ?? "",
    images:
      imagesObj[product.id]?.images?.map?.(
        (image) => `https://d1a26cbu5iquck.cloudfront.net/${image}`
      ) ?? [],
  });
};

const mapVariants = (variantsObj: {
  [productId: string]: {
    variants: {
      variantId: number;
      kind: string;
      stock: number;
      price: number;
    }[];
  };
}) => {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    ...variantsObj[product.id],
  });
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const paging = Number(req.query.paging) || 0;
    const category = req.params.category;
    const [productsData, productsCount] = await Promise.all([
      productModel.getProducts({ paging, category }),
      productModel.countProducts({ category }),
    ]);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariantsByProductId(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products,
      ...(productModel.PAGE_COUNT * (paging + 1) < productsCount
        ? { next_paging: paging + 1 }
        : {}),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ data: [] });
  }
};

export const getStoreProducts = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const paging = Number(req.query.paging) || 0;
    const [productsData, productsCount] = await Promise.all([
      productModel.getStoreProducts({ paging, storeId }),
      productModel.countStoreProducts({ storeId }),
    ]);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariantsByProductId(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products,
      ...(productModel.PAGE_COUNT * (paging + 1) < productsCount
        ? { next_paging: paging + 1 }
        : {}),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ data: [] });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const productsData = await productModel.getProduct(id);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariantsByProductId(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products[0],
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "get products failed" });
  }
};

export const getSnapUp = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const redisProduct = await redisModel.getStr(`snapUp:${id}`);
    if (redisProduct) {
      const data = JSON.parse(redisProduct);
      const stocks = await Promise.all(
        data.variants.map(
          (ele: {
            variantId: number;
            kind: string;
            stock: number;
            price: number;
          }) => redisModel.getStr(`stock:${ele.variantId}`)
        )
      );
      const variants = data.variants.map(
        (
          ele: {
            variantId: number;
            kind: string;
            stock: number;
            price: number;
          },
          index: number
        ) => ({
          ...ele,
          stock: Number(stocks[index]),
        })
      );

      res.status(200).json({ data: { ...data, variants } });
      return;
    }
    const productsData = await productModel.getProduct(id);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariantsByProductId(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));

    await redisModel.setStr(`snapUp:${id}`, JSON.stringify(products[0]));
    await Promise.all(
      variants.map((ele) =>
        redisModel.setStr(`stock:${ele.id}`, String(ele.stock))
      )
    );

    res.json({
      data: products[0],
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "get products failed" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const paging = Number(req.query.paging) || 0;
    const keyword =
      typeof req.query.keyword === "string" ? req.query.keyword : "";
    const [productsData, productsCount] = await Promise.all([
      productModel.searchProducts({ paging, keyword }),
      productModel.countProducts({ keyword }),
    ]);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariantsByProductId(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products,
      ...(productModel.PAGE_COUNT * (paging + 1) < productsCount
        ? { next_paging: paging + 1 }
        : {}),
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "search products failed" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productId = await productModel.createProduct(req.body);
    if (typeof productId !== "number") {
      throw new Error("create product failed");
    }
    if (Array.isArray(res.locals.images) && res.locals.images.length > 0) {
      const productImageData = res.locals.images.map((image) => ({
        productId,
        ...image,
      }));
      productImageModel.createProductImages(productImageData);
    }
    if (typeof req.body.kind === "string" && req.body.kind.length > 0) {
      await productVariantModel.createProductVariants([
        {
          productId,
          kind: req.body.kind,
          stock: req.body.stock,
          price: req.body.price,
        },
      ]);
    }
    if (Array.isArray(req.body.kind) && req.body.kind.length > 0) {
      const variants = req.body.kind.map((kind: string, index: number) => ({
        productId,
        kind,
        stock: req.body.stock[index],
        price: req.body.price[index],
      }));
      await productVariantModel.createProductVariants(variants);
    }
    res.status(200).json(productId);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "create product failed" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ data: { message: "success" } });
  } catch (err) {
    if (err instanceof Error) res.json({ errors: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    await productModel.setProductIsRemove(productId);
    res.status(200).json({ data: { message: "success" } });
  } catch (err) {
    if (err instanceof Error) res.json({ errors: err.message });
  }
};
