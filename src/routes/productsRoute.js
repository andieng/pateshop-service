import express from "express";
import {
  getProducts,
  searchProductsByName,
  searchProductsByPriceRange,
} from "../controllers/productsController";

const productsRouter = express.Router();

productsRouter.get("/search", searchProductsByName);
productsRouter.get("/filter", searchProductsByPriceRange);
productsRouter.get("/", getProducts);

export default productsRouter;
