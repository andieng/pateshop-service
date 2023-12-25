import express from "express";
import {
  getProducts,
  getTopSellingProductsInMonth,
  searchProductsByName,
  searchProductsByPriceRange,
} from "../controllers/productsController";

const productsRouter = express.Router();

productsRouter.get("/search", searchProductsByName);
productsRouter.get("/filter", searchProductsByPriceRange);
productsRouter.get("/", getProducts);
productsRouter.get("/top-selling", getTopSellingProductsInMonth);

export default productsRouter;
