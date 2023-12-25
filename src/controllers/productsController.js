import { Sequelize } from "sequelize";
import { Product, sequelize } from "../models";
import {
  ERROR_MONTH_OR_YEAR_INVALID,
  ERROR_REQUIRE_MONTH_AND_YEAR,
} from "../constants";

export const getProducts = async (req, res) => {
  const { limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const products = await Product.findAll({
    limit: numLimit,
    offset: numOffset,
  });

  const totalProducts = await Product.count();
  const isNext = numOffset + products.length < totalProducts;
  const isPre = numOffset > 0;

  const result = {
    data: products,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: numLimit === 0 ? 0 : Math.ceil(totalProducts / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};

export const searchProductsByName = async (req, res) => {
  const { q, limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const products = await Product.findAll({
    where: {
      productName: {
        [Sequelize.Op.iLike]: `%${q}%`,
      },
    },
    limit: numLimit,
    offset: numOffset,
  });

  const totalProducts = await Product.count({
    where: {
      productName: {
        [Sequelize.Op.iLike]: `%${q}%`,
      },
    },
  });

  const isNext = numOffset + products.length < totalProducts;
  const isPre = numOffset > 0;

  const result = {
    data: products,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: numLimit === 0 ? 0 : Math.ceil(totalProducts / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};

export const searchProductsByPriceRange = async (req, res) => {
  const { startBy, endBy, limit, offset } = req.query;

  if (startBy < 0 || isNaN(startBy)) {
    throw new Error(ERROR_START_INVALID);
  }

  if (endBy < 0 || isNaN(endBy)) {
    throw new Error(ERROR_END_INVALID);
  }

  if (startBy > endBy) {
    throw new Error(ERROR_RANGE_INVALID);
  }

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const products = await Product.findAll({
    where: {
      price: {
        [Sequelize.Op.between]: [startBy, endBy],
      },
    },
    limit: numLimit,
    offset: numOffset,
  });

  const totalProducts = await Product.count({
    where: {
      price: {
        [Sequelize.Op.between]: [startBy, endBy],
      },
    },
  });

  const isNext = numOffset + products.length < totalProducts;
  const isPre = numOffset > 0;

  const result = {
    data: products,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: numLimit === 0 ? 0 : Math.ceil(totalProducts / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};

export const getTopSellingProductsInMonth = async (req, res) => {
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

  const result = await sequelize.query(`
    select 
      products.product_id as "productId", 
      products.image as "productImage",
      products.product_name as "productName",
      products.price,
      sum(order_product.quantity) as "totalSold"
    from 
      order_product 
        join orders on order_product.order_id = orders.order_id
        join products on order_product.product_id = products.product_id
    where 
      orders.status = 'Completed'
      and extract(month from delivery_date) = ${monthStr}
      and extract(year from delivery_date) = ${yearStr}
    group by "productId"
    order by "totalSold" desc
    limit 6
  `);
  const products = result[0].map((item) => ({
    ...item,
    price: Number(item.price),
    totalSold: Number(item.totalSold),
  }));

  const data = {
    products,
    month,
    year,
  };

  return res.json({ data });
};
