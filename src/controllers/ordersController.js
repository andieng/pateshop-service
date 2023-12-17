import { Sequelize, Op } from "sequelize";
import { Product, Order, OrderProduct, Customer } from "../models";
import {
  ERROR_QUANTITY_NOT_ENOUGH,
  ERROR_ORDER_NOT_FOUND,
  ERROR_AT_LEAST_ONE_PRODUCT_IN_ORDER,
  ERROR_PRODUCT_NOT_FOUND,
  ERROR_PRODUCT_ID_NOT_FOUND,
  ERROR_NOT_ENOUGH_PRODUCT,
} from "../constants";

export const getOrders = async (req, res) => {
  const { limit, offset, startDate, endDate } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const whereClause = {};
  if (startDate) {
    whereClause.orderDate = {
      [Op.between]: [
        new Date(startDate),
        endDate ? new Date(endDate) : Sequelize.literal("CURRENT_TIMESTAMP"),
      ],
    };
  }

  const orders = await Order.findAll({
    limit: numLimit,
    offset: numOffset,
    order: [["orderId", "ASC"]],
    where: whereClause,
  });

  const totalOrders = await Order.count({
    where: whereClause,
  });
  const isNext = numOffset + orders.length < totalOrders;
  const isPre = numOffset > 0;

  const result = {
    data: orders,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: numLimit === 0 ? 0 : Math.ceil(totalOrders / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};

export const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    where: {
      orderId,
    },
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        required: true,
      },
    ],
  });
  if (!order) {
    res.status(404);
    throw new Error(ERROR_ORDER_NOT_FOUND);
  }

  //get products in order
  const products = await OrderProduct.findAll({
    where: {
      orderId,
    },
    include: [
      {
        model: Product,
        as: "product",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        required: true,
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt", "orderId", "productId"] },
  });

  const result = {
    data: {
      orderId: order.orderId,
      orderDiscountRate: order.orderDiscountRate,
      totalAmount: order.totalAmount,
      status: order.status,
      deliveryDate: order.deliveryDate,
      orderDate: order.orderDate,
      customer: order.customer,
      products: products,
    },
  };

  return res.json(result);
};

export const createOrder = async (req, res, next) => {
  const {
    orderDiscountRate: reqOrderDiscountRate,
    status,
    deliveryDate,
    orderDate,
    customerId,
    products,
  } = req.body;

  if (!products || products.length <= 0) {
    res.status(400);
    throw new Error(ERROR_AT_LEAST_ONE_PRODUCT_IN_ORDER);
  }
  let totalAmount = 0;
  const listOrderProduct = await Promise.all(
    products.map(async (orderProduct) => {
      const {
        productId,
        productDiscountRate: reqProductDiscountRate,
        quantity,
      } = orderProduct;
      const orderProductInfo = await Product.findByPk(productId, {
        attributes: ["quantity", "price"],
      });

      if (!orderProductInfo) {
        res.status(404);
        throw new Error(ERROR_PRODUCT_ID_NOT_FOUND(productId));
      }

      if (quantity < 0 || quantity > orderProductInfo.quantity) {
        res.status(400);
        throw new Error(
          ERROR_NOT_ENOUGH_PRODUCT(productId, orderProductInfo.quantity)
        );
      }

      const productDiscountRate = reqProductDiscountRate
        ? reqProductDiscountRate
        : 0;
      const amount = orderProductInfo.price * (1 - productDiscountRate);
      totalAmount += amount;

      return {
        productId,
        amount,
        productDiscountRate,
        quantity,
      };
    })
  );

  // create order

  const orderDiscountRate = reqOrderDiscountRate ? reqOrderDiscountRate : 0;
  const orderData = {
    orderDiscountRate,
    totalAmount: totalAmount * (1 - orderDiscountRate),
    status,
    customerId,
  };
  if (deliveryDate) {
    orderData.deliveryDate = deliveryDate;
  }
  if (orderDate) {
    orderData.orderDate = orderDate;
  }
  const order = await Order.create(orderData);
  if (order) {
    listOrderProduct.forEach((item) => {
      item["orderId"] = order.orderId;
    });
    await OrderProduct.bulkCreate(listOrderProduct);
  }

  updateProductQuantity(products, false);
  return res.json(order);
};

function updateProductQuantity(products, isIncrease) {
  const operator = isIncrease ? "+" : "-";

  products.forEach(async (product) => {
    await Product.update(
      {
        quantity: Sequelize.literal(
          `"quantity" ${operator} ${product.quantity}`
        ),
      },
      {
        where: {
          productId: product.productId,
        },
      }
    );
  });
}

export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findByPk(orderId);
  if (!order) {
    res.status(404);
    throw new Error(ERROR_ORDER_NOT_FOUND);
  }
  const products = await OrderProduct.findAll({
    where: {
      orderId,
    },
    attributes: ["quantity", "productId"],
  });
  await OrderProduct.destroy({
    where: {
      orderId,
    },
  });
  //update quantity
  updateProductQuantity(products, true);
  await Order.destroy({
    where: {
      orderId,
    },
  });
  return res.json({ result: true });
};

export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const {
    customerId,
    orderDiscountRate,
    status,
    deliveryDate,
    orderDate,
    products,
  } = req.body;
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new Error(ERROR_ORDER_NOT_FOUND);
  }
  // Update order products
  if (products && products.length > 0) {
    await Promise.all(
      products.map(async (orderProduct) => {
        const { productId, quantity, productDiscountRate } = orderProduct;
        const orderProductInfo = await Product.findByPk(productId, {
          attributes: ["quantity", "price"],
        });
        const currentOrderProduct = await OrderProduct.findOne({
          where: {
            orderId,
            productId,
          },
          attributes: ["quantity", "productDiscountRate"],
        });

        const newProductDiscountRate = productDiscountRate
          ? productDiscountRate
          : currentOrderProduct.productDiscountRate;
        const amount =
          quantity * (1 - newProductDiscountRate) * orderProductInfo.price;

        await OrderProduct.upsert(
          {
            orderId,
            productId,
            quantity,
            productDiscountRate,
            amount,
          },
          { where: { orderId, productId } }
        );
        if (quantity) {
          const newQuantity = currentOrderProduct.quantity
            ? currentOrderProduct.quantity - quantity
            : -quantity;

          //update quantity
          await Product.update(
            {
              quantity: Sequelize.literal(`"quantity" + ${newQuantity}`),
            },
            {
              where: {
                productId: orderProduct.productId,
              },
            }
          );
        }
      })
    );
  }

  if (customerId) {
    order.customerId = customerId;
  }
  if (status) {
    order.status = status;
  }
  if (deliveryDate) {
    order.deliveryDate = deliveryDate;
  }
  if (orderDate) {
    order.orderDate = orderDate;
  }
  if (orderDiscountRate) {
    order.orderDiscountRate = orderDiscountRate;
  }
  const totalAmount = await computeTotalAmountOrder(orderId);
  order.totalAmount = totalAmount;
  await order.save();

  return res.json(order);
};

async function computeTotalAmountOrder(orderId) {
  let totalAmount = 0;
  const order = await Order.findByPk(orderId, {
    attributes: ["orderDiscountRate"],
  });

  const orderProducts = await OrderProduct.findAll({
    where: { orderId },
    attributes: ["amount"],
  });

  if (orderProducts) {
    orderProducts.forEach((element) => {
      totalAmount += Number(element.amount);
    });
  }

  return totalAmount * (1 - order.orderDiscountRate);
}
