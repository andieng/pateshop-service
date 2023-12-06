import express from "express";
import { getCustomers } from "../controllers/customersController";

const customersRouter = express.Router();

customersRouter.get("/", getCustomers);

export default customersRouter;
