import { Sequelize } from "sequelize";
import { Product } from "../models";

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
