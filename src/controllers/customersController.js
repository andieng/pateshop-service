import { Sequelize } from "sequelize";
import { Customer, Order, OrderProduct, Product } from "../models";
import { ERROR_CUSTOMER_NOT_FOUND } from "../constants";

export const getCustomers = async (req, res) => {
  const { limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const customers = await Customer.findAll({
    limit: numLimit,
    offset: numOffset,
    order: [["customerId", "ASC"]],
  });

  const total = await Customer.count();
  const isNext = numOffset + customers.length < total;
  const isPre = numOffset > 0;

  const result = {
    data: customers,
    paging: {
      offset: numOffset,
      limit: numLimit,
      total,
      isNext,
      isPre,
    },
  };
  return res.json(result);
};

export const createCustomer = async (req, res) => {
  const { customerName, address, phoneNumber, email } = req.body;
  const customer = await Customer.create({
    customerName,
    address,
    phoneNumber,
    email,
  });
  return res.json({ customerId: customer.customerId });
};

export const deleteCustomer = async (req, res) => {
  const { customerId } = req.params;
  const customer = await Order.findByPk(customerId);
  if(!customer){
    throw new Error(ERROR_CUSTOMER_NOT_FOUND)
  }
  const orders = await Order.findAll({
    where: {customerId},
    attributes: ["orderId"],
  });
  //update quantity of product
  const orderProducts = await OrderProduct.findAll({
    where: {
      orderId: {
        [Sequelize.Op.in]: orders.map((item) => item.orderId)
      }
    },
    attributes: ["quantity", "productId"],
  });
  await Promise.all(orderProducts.map(async (order) => {
    await Product.update({
      quantity: Sequelize.literal(`"quantity" + ${order.quantity}`),
    }, {
      where: { productId: order.productId },
    });
  }));
  

  // delete product_order
  await OrderProduct.destroy({
    where: {
      orderId: {
        [Sequelize.Op.in]: orders.map((item) => item.orderId)
      }
    }
  });
  //delete order
  await Order.destroy({ where: {customerId} });
  await Customer.destroy({
    where: {
      customerId,
    },
  });
  return res.json({ result: true });
};

export const updateCustomer = async (req, res) => {
  const { customerId } = req.params;
  const customer = await Order.findByPk(customerId);
  if(!customer){
    throw new Error(ERROR_CUSTOMER_NOT_FOUND)
  }
  const { customerName, address, phoneNumber, email } = req.body;

  const updateObject = {};
  if (customerName !== undefined && customerName !== null) {
    updateObject.customerName = customerName;
  }
  if (address !== undefined && address !== null) {
    updateObject.address = address;
  }
  if (phoneNumber !== undefined && phoneNumber !== null) {
    updateObject.phoneNumber = phoneNumber;
  }
  if (email !== undefined && email !== null) {
    updateObject.email = email;
  }

  if (Object.keys(updateObject).length > 0) {
    await Customer.update(updateObject, {
      where: {
        customerId,
      },
    });

    return res.json({ data: { result: true } });
  }
  return res.json({ data: { result: false } });
};
