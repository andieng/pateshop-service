import {
  ERROR_MONTH_OR_YEAR_INVALID,
  ERROR_REQUIRE_MONTH_AND_YEAR,
} from "../constants";
import { sequelize } from "../models";

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
