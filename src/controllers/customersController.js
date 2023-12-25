import { Customer, Order, sequelize } from "../models";
import {
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_REQUIRE_MONTH_AND_YEAR,
  ERROR_MONTH_OR_YEAR_INVALID,
} from "../constants";

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
      totalPages: numLimit === 0 ? 0 : Math.ceil(totalCustomers / numLimit),
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

export const countCustomersInMonth = async (req, res) => {
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
      count(*) as count, 
      extract(month from created_at) as month, 
      extract(year from created_at) as year
    from customers
    where 
      extract(month from created_at) = ${monthStr} 
      and extract(year from created_at) = ${yearStr}
    group by month, year`);

  const data = {
    count: result[0][0]?.count ? Number(result[0][0].count) : 0,
    month,
    year,
  };

  return res.json({ data });
};
