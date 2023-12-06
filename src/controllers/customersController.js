import { Customer } from "../models";

export const getCustomers = async (req, res) => {
  const { limit, offset } = req.query;

  const customers = await Customer.findAll({
    limit: limit ? Number(limit) : 100,
    offset: offset ? Number(offset) : 0,
    order: [["customerId", "ASC"]],
  });
  return res.json(customers);
};
