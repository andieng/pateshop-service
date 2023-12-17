import { Sequelize } from "sequelize";
import { Product, Category, OrderProduct } from "../models";
import {
  MSG_DELETE_SUCCESSFULLY,
  MSG_ADD_SUCCESSFULLY,
  MSG_UPDATE_SUCCESSFULLY,
  ERROR_CATEGORY_NOT_FOUND,
  ERROR_QUANTITY_INVALID,
  ERROR_PRICE_INVALID,
  ERROR_PRODUCT_NOT_FOUND,
  ERROR_PRODUCT_SKU_NULL,
  ERROR_PRODUCT_SKU_EXISTED,
  ERROR_CATEGORY_NAME_NULL,
  ERROR_COST_INVALID,
  ERROR_START_INVALID,
  ERROR_END_INVALID,
  ERROR_RANGE_INVALID,
} from "../constants";

export const getCategories = async (req, res) => {
  const { limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const categories = await Category.findAll({
    limit: numLimit,
    offset: numOffset,
    order: [["categoryId", "ASC"]],
  });

  const totalCategories = await Category.count();

  const isNext = numOffset + categories.length < totalCategories;
  const isPre = numOffset > 0;

  const result = {
    data: categories,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: Math.ceil(totalCategories / numLimit),
      isNext,
      isPre,
    },
  };
  return res.json(result);
};

export const getProductsOfCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new Error(ERROR_CATEGORY_NOT_FOUND);
  }

  const products = await Product.findAll({
    limit: limit ? Number(limit) : 100,
    offset: offset ? Number(offset) : 0,
    order: [["productId", "ASC"]],
    where: {
      categoryId,
    },
  });

  const totalProducts = await Product.count({ where: { categoryId } });

  const isNext = numOffset + products.length < totalProducts;
  const isPre = numOffset > 0;

  const result = {
    data: products,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: Math.ceil(totalProducts / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};

export const addCategory = async (req, res) => {
  const { categoryName } = req.body;

  if (
    categoryName === "" ||
    categoryName === undefined ||
    categoryName === null
  ) {
    throw new Error(ERROR_CATEGORY_NAME_NULL);
  }

  const category = await Category.create({
    categoryName,
  });

  return res.json({
    message: MSG_ADD_SUCCESSFULLY,
    categoryId: category.categoryId,
  });
};

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new Error(ERROR_CATEGORY_NOT_FOUND);
  }

  const productsToDelete = await Product.findAll({
    attributes: ["product_id"],
    where: {
      category_id: categoryId,
    },
  });

  const productIds = productsToDelete.map((product) => product.product_id);

  await OrderProduct.destroy({
    where: {
      product_id: productIds,
    },
  });

  await Product.destroy({
    where: {
      category_id: categoryId,
    },
  });

  await Category.destroy({
    where: {
      category_id: categoryId,
    },
  });

  return res.json({ message: MSG_DELETE_SUCCESSFULLY });
};

export const updateCategory = async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new Error(ERROR_CATEGORY_NOT_FOUND);
  }

  const { categoryName } = req.body;
  if (
    categoryName === "" ||
    categoryName === undefined ||
    categoryName === null
  ) {
    throw new Error(ERROR_CATEGORY_NAME_NULL);
  }

  category.categoryName = categoryName;
  await category.save();

  return res.json({ message: MSG_UPDATE_SUCCESSFULLY });
};

export const getProduct = async (req, res) => {
  const { productId, categoryId } = req.params;

  const product = await Product.findOne({
    where: {
      productId,
      categoryId,
    },
  });

  if (!product) {
    throw new Error(ERROR_PRODUCT_NOT_FOUND);
  }

  return res.json(product);
};

export const addProduct = async (req, res) => {
  const { categoryId } = req.params;
  const {
    productSku,
    productName,
    description,
    quantity,
    price,
    cost,
    image,
    size,
    color,
  } = req.body;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new Error(ERROR_CATEGORY_NOT_FOUND);
  }

  if (productSku === null || productSku === undefined || productSku === "") {
    throw new Error(ERROR_PRODUCT_SKU_NULL);
  }

  const existingSKU = await Product.findOne({ where: { productSku } });

  if (existingSKU) {
    throw new Error(ERROR_PRODUCT_SKU_EXISTED);
  }

  if (quantity !== undefined) {
    if (quantity < 0 || isNaN(quantity)) {
      throw new Error(ERROR_QUANTITY_INVALID);
    }
  }

  if (price !== undefined) {
    if (price < 0 || isNaN(price)) {
      throw new Error(ERROR_PRICE_INVALID);
    }
  }

  if (cost !== undefined) {
    if (cost < 0 || isNaN(cost)) {
      throw new Error(ERROR_COST_INVALID);
    }
  }

  const productData = {
    productSku,
    productName,
    categoryId,
    description,
    quantity,
    price,
    cost,
    image,
    size,
    color,
  };

  const filteredProductData = Object.fromEntries(
    Object.entries(productData).filter(([_, value]) => value !== undefined)
  );

  const product = await Product.create(filteredProductData);

  return res.json({
    message: MSG_ADD_SUCCESSFULLY,
    productId: product.productId,
  });
};

export const updateProduct = async (req, res) => {
  const { productId, categoryId } = req.params;

  const product = await Product.findOne({
    where: {
      productId,
      categoryId,
    },
  });

  if (!product) {
    throw new Error(ERROR_PRODUCT_NOT_FOUND);
  }

  const {
    productSku,
    productName,
    description,
    quantity,
    price,
    cost,
    image,
    size,
    color,
  } = req.body;

  if (productSku !== undefined) {
    if (productSku === "") throw new Error(ERROR_PRODUCT_SKU_NULL);

    if (productSku != null && productSku !== product.productSku) {
      const existingSKU = await Product.findOne({ where: { productSku } });
      if (existingSKU) {
        throw new Error(ERROR_PRODUCT_SKU_EXISTED);
      }
    }
    product.productSku = productSku;
  }

  if (productName !== undefined) {
    product.productName = productName;
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (quantity !== undefined) {
    if (quantity < 0 || isNaN(quantity)) {
      throw new Error(ERROR_QUANTITY_INVALID);
    }
    product.quantity = Math.max(0, quantity);
  }

  if (price !== undefined) {
    if (price < 0 || isNaN(price)) {
      throw new Error(ERROR_PRICE_INVALID);
    }
    product.price = Math.max(0, price);
  }

  if (cost !== undefined) {
    if (cost < 0 || isNaN(cost)) {
      throw new Error(ERROR_COST_INVALID);
    }
    product.cost = cost;
  }

  if (image !== undefined) {
    product.image = image;
  }

  if (size !== undefined) {
    product.size = size;
  }

  if (color !== undefined) {
    product.color = color;
  }

  await product.save();

  return res.json({ message: MSG_UPDATE_SUCCESSFULLY });
};

export const deleteProduct = async (req, res) => {
  const { productId, categoryId } = req.params;

  const product = await Product.findOne({
    where: {
      productId,
      categoryId,
    },
  });

  if (!product) {
    throw new Error(ERROR_PRODUCT_NOT_FOUND);
  }

  await OrderProduct.destroy({
    where: {
      product_id: productId,
    },
  });

  await Product.destroy({
    where: {
      productId: productId,
    },
  });

  return res.json({ message: MSG_DELETE_SUCCESSFULLY });
};

export const searchProductsByName = async (req, res) => {
  const { categoryId } = req.params;
  const { q, limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const products = await Product.findAll({
    where: {
      categoryId,
      productName: {
        [Sequelize.Op.iLike]: `%${q}%`,
      },
    },
    limit: numLimit,
    offset: numOffset,
  });

  const totalProducts = await Product.count({
    where: {
      categoryId,
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
      totalPages: Math.ceil(totalProducts / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};

export const searchProductsByPriceRange = async (req, res) => {
  const { categoryId } = req.params;
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
      categoryId,
      price: {
        [Sequelize.Op.between]: [startBy, endBy],
      },
    },
    limit: numLimit,
    offset: numOffset,
  });

  const totalProducts = await Product.count({
    where: {
      categoryId,
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
      totalPages: Math.ceil(totalProducts / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};
