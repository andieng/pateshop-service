import express from "express";
import {
  getOrders,
  getOrderDetails,
  deleteOrder,
  updateOrder,
  createOrder,
  countOrdersInMonth,
  getOrderAnalytics,
} from "../controllers/ordersController";
const ordersRouter = express.Router();

ordersRouter.get("/", getOrders);
ordersRouter.get("/count", countOrdersInMonth);
ordersRouter.get("/analytics", getOrderAnalytics);
ordersRouter.get("/:orderId", getOrderDetails);
ordersRouter.delete("/:orderId", deleteOrder);
ordersRouter.put("/:orderId", updateOrder);
ordersRouter.post("/", createOrder);

export default ordersRouter;
