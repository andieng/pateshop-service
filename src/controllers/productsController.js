import { Product, Category } from "../models";

export const getCategories = async (req, res) => {
  const categories = await Category.findAll();
  return res.json(categories);
};

export const getProductsOfCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { limit, offset } = req.query;

  const products = await Product.findAll({
    limit: limit ? Number(limit) : 100,
    offset: offset ? Number(offset) : 0,
    order: [["productId", "ASC"]],
    where: {
      categoryId,
    },
  });
  return res.json(products);
};
