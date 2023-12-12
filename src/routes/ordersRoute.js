import express from "express";
import { getOrders,getDetailOrder,deleteOrder,updateOrder,createOrder } from "../controllers/ordersController";
const ordersRouter = express.Router();

ordersRouter.get("/",getOrders)
ordersRouter.get("/:orderId",getDetailOrder)
ordersRouter.delete("/:orderId",deleteOrder)
ordersRouter.put("/:orderId",updateOrder)
ordersRouter.post("/",createOrder)



export default ordersRouter;
