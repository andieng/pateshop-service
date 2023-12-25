import express from "express";
import { getReportDataInMonth } from "../controllers/reportsController";

const reportsRouter = express.Router();

reportsRouter.get("/", getReportDataInMonth);

export default reportsRouter;
