import express from "express";
import { getCustomers,createCustomer,deleteCustomer,updateCustomer } from "../controllers/customersController";

const customersRouter = express.Router();

customersRouter.get("/", getCustomers);
customersRouter.put("/:customerId", updateCustomer);
customersRouter.delete("/:customerId", deleteCustomer);
customersRouter.post("/", createCustomer);

export default customersRouter;
