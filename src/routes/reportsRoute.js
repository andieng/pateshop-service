import express from "express";
import {
  getReportDataInMonth,
  getNumberOfSoldProducts,
  getProfitAndRevenue,
} from "../controllers/reportsController";

const reportsRouter = express.Router();

reportsRouter.get("/sold", getNumberOfSoldProducts);
reportsRouter.get("/statistic", getProfitAndRevenue);
reportsRouter.get("/", getReportDataInMonth);

export default reportsRouter;
