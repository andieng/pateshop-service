import { Sequelize } from "sequelize";
import { Customer, Order } from "../models";
import { ERROR_CUSTOMER_NOT_FOUND } from "../constants";

export const getCustomers = async (req, res) => {
  const { limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const customers = await Customer.findAll({
    limit: numLimit,
    offset: numOffset,
    order: [["customerId", "ASC"]],
    where: {
      deletedAt: null,
    },
  });

  const totalCustomers = await Customer.count({
    where: {
      deletedAt: null,
    },
  });
  const isNext = numOffset + customers.length < totalCustomers;
  const isPre = numOffset > 0;

  const result = {
    data: customers,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: Math.ceil(totalCustomers / numLimit),
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

  const customer = await Customer.findOne({
    where: {
      customerId,
      deletedAt: null,
    },
  });
  if (!customer) {
    res.status(404);
    throw new Error(ERROR_CUSTOMER_NOT_FOUND);
  }
  customer.deletedAt = Date.now();
  await customer.save();

  await Order.update(
    { customerId: null },
    {
      where: {
        customerId,
      },
    }
  );

  return res.json({ result: true });
};

export const updateCustomer = async (req, res) => {
  const { customerId } = req.params;
  const customer = await Customer.findOne({
    where: {
      customerId,
      deletedAt: null,
    },
  });
  if (!customer) {
    res.status(404);
    throw new Error(ERROR_CUSTOMER_NOT_FOUND);
  }

  const { customerName, address, phoneNumber, email } = req.body;
  if (customerName) {
    customer.customerName = customerName;
  }
  if (address) {
    customer.address = address;
  }
  if (phoneNumber) {
    customer.phoneNumber = phoneNumber;
  }
  if (email) {
    customer.email = email;
  }
  await customer.save();

  return res.json(customer);
};

export const searchCustomersByName = async (req, res) => {
  const { q, limit, offset } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;

  const customers = await Customer.findAll({
    where: {
      customerName: {
        [Sequelize.Op.iLike]: `%${q}%`,
      },
    },
    limit: numLimit,
    offset: numOffset,
  });

  const totalCustomers = await Customer.count({
    where: {
      customerName: {
        [Sequelize.Op.iLike]: `%${q}%`,
      },
    },
  });

  const isNext = numOffset + customers.length < totalCustomers;
  const isPre = numOffset > 0;

  const result = {
    data: customers,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPages: Math.ceil(totalCustomers / numLimit),
      isNext,
      isPre,
    },
  };

  return res.json(result);
};
