import pg from "pg";
import { Sequelize, DataTypes } from "sequelize";
import _Category from "./Category.js";
import _Customer from "./Customer.js";
import _OrderProduct from "./OrderProduct.js";
import _Order from "./Order.js";
import _Product from "./Product.js";
import _User from "./User.js";

function initModels(sequelize) {
  const Category = _Category.init(sequelize, DataTypes);
  const Customer = _Customer.init(sequelize, DataTypes);
  const OrderProduct = _OrderProduct.init(sequelize, DataTypes);
  const Order = _Order.init(sequelize, DataTypes);
  const Product = _Product.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);

  Order.belongsToMany(Product, {
    as: "productIdProducts",
    through: OrderProduct,
    foreignKey: "orderId",
    otherKey: "productId",
  });
  Product.belongsToMany(Order, {
    as: "orderIdOrders",
    through: OrderProduct,
    foreignKey: "productId",
    otherKey: "orderId",
  });
  Product.belongsTo(Category, { as: "category", foreignKey: "categoryId" });
  Category.hasMany(Product, { as: "products", foreignKey: "categoryId" });
  Order.belongsTo(Customer, { as: "customer", foreignKey: "customerId" });
  Customer.hasMany(Order, { as: "orders", foreignKey: "customerId" });
  OrderProduct.belongsTo(Order, { as: "order", foreignKey: "orderId" });
  Order.hasMany(OrderProduct, { as: "orderProducts", foreignKey: "orderId" });
  OrderProduct.belongsTo(Product, { as: "product", foreignKey: "productId" });
  Product.hasMany(OrderProduct, {
    as: "orderProducts",
    foreignKey: "productId",
  });

  return {
    Category,
    Customer,
    OrderProduct,
    Order,
    Product,
    User,
  };
}

let sequelize;
let Category, Customer, OrderProduct, Order, Product, User;
let currentHost, currentDatabase, currentUser, currentPassword, isConnected;

async function initializeConnection(host, database, username, password) {
  currentHost = host;
  currentDatabase = database;
  currentUser = username;
  currentPassword = password;

  sequelize = new Sequelize({
    host,
    database,
    username,
    password,
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
    dialectModule: pg,
  });

  isConnected = false;
  try {
    await sequelize.authenticate();
  } catch (err) {
    return false;
  }
  isConnected = true;
  console.info("Sequelize connected");
  ({ Category, Customer, OrderProduct, Order, Product, User } =
    initModels(sequelize));
  return true;
}

export {
  Category,
  Customer,
  OrderProduct,
  Order,
  Product,
  User,
  initializeConnection,
  currentHost,
  currentDatabase,
  currentUser,
  currentPassword,
  isConnected,
  sequelize,
};
