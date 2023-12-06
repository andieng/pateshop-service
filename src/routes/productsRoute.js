import express from "express";
import {
  getProductsOfCategory,
  getCategories,
} from "../controllers/productsController";

const productsRouter = express.Router();

productsRouter.get("/", getCategories);
productsRouter.get("/:categoryId", getProductsOfCategory);

export default productsRouter;
