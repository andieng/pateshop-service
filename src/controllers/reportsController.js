import {
  ERROR_CATEGORY_NOT_FOUND,
  ERROR_DATE_INVALID,
  ERROR_DATE_RANGE_INVALID,
  ERROR_MONTH_INVALID,
  ERROR_MONTH_OR_YEAR_INVALID,
  ERROR_OPTION_INVALID,
  ERROR_REQUIRE_MONTH_AND_YEAR,
  ERROR_YEAR_INVALID,
} from "../constants";
import { Category, sequelize } from "../models";

export const getReportDataInMonth = async (req, res) => {
  const { month: monthStr, year: yearStr } = req.query;

  if (!monthStr || !yearStr) {
    res.status(400);
    throw new Error(ERROR_REQUIRE_MONTH_AND_YEAR);
  }

  const month = Number(monthStr),
    year = Number(yearStr);
  if (month < 1 || month > 12 || year < 1) {
    res.status(400);
    throw new Error(ERROR_MONTH_OR_YEAR_INVALID);
  }

  const revenueResult = await sequelize.query(`
        select 
            sum(total_amount) as revenue, 
            extract(month from delivery_date) as month, 
            extract(year from delivery_date) as year
        from orders
            join order_product on orders.order_id = order_product.order_id
            join products on order_product.product_id = products.product_id
        where
            orders.status = 'Completed'
            and extract(month from delivery_date) = ${monthStr}
            and extract(year from delivery_date) = ${yearStr}
        group by month, year
    `);

  const costResult = await sequelize.query(`
        select 
            sum(products.cost * order_product.quantity) as cost,
            extract(month from delivery_date) as month, 
            extract(year from delivery_date) as year
        from 
            orders
                join order_product on orders.order_id = order_product.order_id
                join products on order_product.product_id = products.product_id
        where
            orders.status = 'Completed'
            and extract(month from delivery_date) = ${monthStr}
            and extract(year from delivery_date) = ${yearStr}
        group by month, year
    `);

  const revenue = Number(revenueResult[0][0].revenue) ?? 0,
    cost = Number(costResult[0][0].cost) ?? 0;
  let profit = 0;
  if (cost === 0 && revenue !== 0) {
    profit = 1;
  } else if (cost !== 0) {
    profit = (revenue - cost) / revenue;
  }

  const data = {
    revenue,
    cost,
    profit,
    month,
    year,
  };

  return res.json({ data });
};

export const getNumberOfSoldProducts = async (req, res) => {
  const { option, categoryId, startDate, endDate, year, month } = req.query;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    res.status(400);
    throw new Error(ERROR_CATEGORY_NOT_FOUND);
  }

  if (startDate !== undefined && endDate !== undefined) {
    const dateRegex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      res.status(400);
      throw new Error(ERROR_DATE_INVALID);
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj > endDateObj) {
      res.status(400);
      throw new Error(ERROR_DATE_RANGE_INVALID);
    }
  }

  if (year !== undefined) {
    const yearRegex = /^\d{4}$/;

    if (!yearRegex.test(year)) {
      res.status(400);
      throw new Error(ERROR_YEAR_INVALID);
    }
  }

  if (month !== undefined) {
    const monthRegex = /^(0?[1-9]|1[0-2])$/;

    if (!monthRegex.test(month)) {
      res.status(400);
      throw new Error(ERROR_MONTH_INVALID);
    }
  }

  let dateCondition = "";
  let groupBy = "";

  if (option === "daily") {
    dateCondition = `AND DATE(o.delivery_date) BETWEEN '${startDate}' AND '${endDate}'`;
    groupBy = "GROUP BY p.product_name";
  } else if (option === "monthly") {
    dateCondition = `AND EXTRACT(YEAR FROM o.delivery_date) = ${year}`;
    groupBy = "GROUP BY p.product_name";
  } else if (option === "yearly") {
    dateCondition = "";
    groupBy = "GROUP BY p.product_name";
  } else {
    res.status(400);
    throw new Error(ERROR_OPTION_INVALID);
  }

  const query = `
    SELECT p.product_name, SUM(op.quantity) AS total_quantity_sold
    FROM order_product op
    JOIN products p ON op.product_id = p.product_id
    JOIN orders o ON op.order_id = o.order_id
    WHERE p.category_id = ${categoryId}
    ${dateCondition}
    AND o.status = 'Completed'
    ${groupBy};
  `;

  const totalQuantitySold = await sequelize.query(query);
  const result = totalQuantitySold[0];

  return res.json({ totalQuantitySold: result });
};

const getFullDateRangeList = (data, _startDate, _endDate) => {
  let dateRange = [];
  let startDate = new Date(_startDate);
  startDate.setDate(startDate.getDate() + 1);
  let endDate = new Date(_endDate);
  let currentDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  while (currentDate <= endDate) {
    let isoDate = currentDate.toISOString().slice(0, 10);
    dateRange.push(isoDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  dateRange.forEach((date) => {
    let found = data.some((item) => item.date === date);
    if (!found) {
      data.push({ date: date, revenue: "0", profit: "0" });
    }
  });

  data.sort((a, b) => (a.date > b.date ? 1 : -1));

  return data;
};

const getFullMonthList = (data) => {
  const yearData = {};

  data.forEach((entry) => {
    const year = entry.year;
    if (!yearData[year]) {
      yearData[year] = {};
    }
    yearData[year][entry.month] = {
      revenue: entry.revenue,
      profit: entry.profit,
    };
  });

  for (const year in yearData) {
    for (let month = 1; month <= 12; month++) {
      if (!yearData[year][month]) {
        yearData[year][month] = {
          revenue: "0",
          profit: "0",
        };
      }
    }
  }

  const updatedData = [];
  for (const year in yearData) {
    for (let month = 1; month <= 12; month++) {
      updatedData.push({
        year: year,
        month: month.toString(),
        revenue: yearData[year][month].revenue,
        profit: yearData[year][month].profit,
      });
    }
  }

  return updatedData;
};

export const getProfitAndRevenue = async (req, res) => {
  const { option, startDate, endDate, year, month } = req.query;

  if (startDate !== undefined && endDate !== undefined) {
    const dateRegex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      res.status(400);
      throw new Error(ERROR_DATE_INVALID);
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj > endDateObj) {
      res.status(400);
      throw new Error(ERROR_DATE_RANGE_INVALID);
    }
  }

  if (year !== undefined) {
    const yearRegex = /^\d{4}$/;

    if (!yearRegex.test(year)) {
      res.status(400);
      throw new Error(ERROR_YEAR_INVALID);
    }
  }

  if (month !== undefined) {
    const monthRegex = /^(0?[1-9]|1[0-2])$/;

    if (!monthRegex.test(month)) {
      res.status(400);
      throw new Error(ERROR_MONTH_INVALID);
    }
  }

  let query = "";

  if (option === "yearly") {
    query = `
      SELECT EXTRACT(YEAR FROM o.delivery_date) AS year,
      SUM(o.total_amount) AS revenue,
      SUM(
        o.total_amount -
        (SELECT SUM(op.quantity * p.cost)
          FROM order_product op
          JOIN products p ON op.product_id = p.product_id
          WHERE op.order_id = o.order_id)
      ) AS profit
      FROM orders o
      WHERE o.status = 'Completed'
      GROUP BY EXTRACT(YEAR FROM o.delivery_date);
    `;
  } else if (option === "monthly") {
    query = `
      SELECT EXTRACT(YEAR FROM o.delivery_date) AS year,
      EXTRACT(MONTH FROM o.delivery_date) AS month,
      SUM(o.total_amount) AS revenue,
      SUM(
        o.total_amount -
        (SELECT SUM(op.quantity * p.cost)
          FROM order_product op
          JOIN products p ON op.product_id = p.product_id
          WHERE op.order_id = o.order_id)
      ) AS profit
      FROM orders o
      WHERE o.status = 'Completed'
      AND EXTRACT(YEAR FROM o.delivery_date) = ${year}
      GROUP BY EXTRACT(YEAR FROM o.delivery_date), EXTRACT(MONTH FROM o.delivery_date);
    `;
  } else if (option === "daily") {
    query = `
      SELECT DATE(o.delivery_date) AS date,
      SUM(o.total_amount) AS revenue,
      SUM(
        o.total_amount -
        (SELECT SUM(op.quantity * p.cost)
          FROM order_product op
          JOIN products p ON op.product_id = p.product_id
          WHERE op.order_id = o.order_id)
      ) AS profit
      FROM orders o
      WHERE o.delivery_date BETWEEN '${startDate}' AND '${endDate}'
      AND o.status = 'Completed'
      GROUP BY o.delivery_date;
    `;
  } else {
    res.status(400);
    throw new Error(ERROR_OPTION_INVALID);
  }

  const profitAndRevenue = await sequelize.query(query);
  let result = {};
  if (option === "daily") {
    result = getFullDateRangeList(profitAndRevenue[0], startDate, endDate);
  } else if (option === "monthly") {
    result = getFullMonthList(profitAndRevenue[0]);
  }
  return res.json({ result });
};
