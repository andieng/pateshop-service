import { Sequelize } from "sequelize";
import { Product } from "../models";

export const getProducts = async (req, res) => {
  const product = await Product.findAll();
  return res.json(product);
};

export const searchProductsByName = async (req, res) => {
  const { q } = req.query;

  const products = await Product.findAll({
    where: {
      productName: {
        [Sequelize.Op.iLike]: `%${q}%`,
      },
    },
  });

  return res.json(products);
};

export const searchProductsByPriceRange = async (req, res) => {
  const { startBy, endBy } = req.body;

  if (startBy < 0 || isNaN(startBy)) {
    throw new Error(ERROR_START_INVALID);
  }

  if (endBy < 0 || isNaN(endBy)) {
    throw new Error(ERROR_END_INVALID);
  }

  if (startBy > endBy) {
    throw new Error(ERROR_RANGE_INVALID);
  }

  const products = await Product.findAll({
    where: {
      price: {
        [Sequelize.Op.between]: [startBy, endBy],
      },
    },
  });

  return res.json(products);
};
