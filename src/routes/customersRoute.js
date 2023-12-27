import express from "express";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  updateCustomer,
  countCustomersInMonth,
  searchCustomersByName,
} from "../controllers/customersController";

const customersRouter = express.Router();

customersRouter.get("/search", searchCustomersByName);
customersRouter.get("/", getCustomers);
customersRouter.get("/count", countCustomersInMonth);
customersRouter.put("/:customerId", updateCustomer);
customersRouter.delete("/:customerId", deleteCustomer);
customersRouter.post("/", createCustomer);

export default customersRouter;
