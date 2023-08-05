import { Router } from "express";
import { query, param } from "express-validator";
import multer from "multer";
import {
  getProducts,
  getProduct,
  getSnapUp,
  getStoreProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.js";
import authenticate from "../middlewares/authenticate.js";
import * as validator from "../middlewares/validator.js";
import * as authorization from "../middlewares/authorization.js";
import * as image from "../middlewares/image.js";
const uploadToBuffer = multer({ storage: multer.memoryStorage() });
const router = Router();

router
  .route("/products")
  .get([
    query("paging").if(query("paging").exists()).isInt(),
    validator.handleResult,
    getProducts,
  ]);

router
  .route("/product/:id")
  .get([
    param("id").not().isEmpty().trim(),
    validator.handleResult,
    getProduct,
  ]);

router
  .route("/snapup/:id")
  .get([param("id").not().isEmpty().trim(), validator.handleResult, getSnapUp]);

router
  .route("/store/:storeId/products")
  .get([
    param("storeId").not().isEmpty().trim(),
    validator.handleResult,
    getStoreProducts,
  ]);

router
  .route("/products/search")
  .get(
    query("keyword").not().isEmpty().trim(),
    query("paging").if(query("paging").exists()).isInt(),
    validator.handleResult,
    searchProducts
  );

router
  .route("/products/:category")
  .get(
    param("category").isIn([
      "all",
      "video_game_peripherals",
      "clothes",
      "shoes",
    ]),
    query("paging").if(query("paging").exists()).isInt(),
    validator.handleResult,
    getProducts
  );

router.route("/product/insert").post([
  uploadToBuffer.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  authenticate,
  authorization.checkProductPermission,
  image.checkFileType,
  image.saveProductImagesToS3,
  createProduct,
]);

router.route("/product/update").put(updateProduct);

router
  .route("/product/:id/delete")
  .delete([
    param("id").not().isEmpty().trim(),
    validator.handleResult,
    authenticate,
    authorization.checkProductPermission,
    deleteProduct,
  ]);

export default router;
