import express from "express";
import {
  getOrders,
  getOrderDetails,
  deleteOrder,
  updateOrder,
  createOrder,
} from "../controllers/ordersController";
const ordersRouter = express.Router();

ordersRouter.get("/", getOrders);
ordersRouter.get("/:orderId", getOrderDetails);
ordersRouter.delete("/:orderId", deleteOrder);
ordersRouter.put("/:orderId", updateOrder);
ordersRouter.post("/", createOrder);

export default ordersRouter;
