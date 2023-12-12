import { NOW, Sequelize } from "sequelize";
import { Product, Order, OrderProduct, Customer } from "../models";
const { Op } = require("sequelize");
import { ERROR_QUANTITY_NOT_ENOUGH,ERROR_ORDER_NOT_FOUND,ERROR_AT_LEAST_ONE_PRODUCT_IN_ORDER } from "../constants";
export const getOrders = async (req, res) => {
  const { limit, offset, startDate, endDate } = req.query;

  const numLimit = limit ? Number(limit) : 100;
  const numOffset = offset ? Number(offset) : 0;
  
  const whereClause = {};
  if (startDate) {
    whereClause.orderDate = {
      [Op.between]: [new Date(startDate), endDate ? new Date(endDate) : Sequelize.literal('CURRENT_TIMESTAMP')],
    };
  }
  
  const orders = await Order.findAll({
    limit: numLimit,
    offset: numOffset,
    order: [["orderId", "ASC"]],
    where: whereClause,
  });
  
  const Allorders = await Order.findAll({
    where: whereClause,
  });
  const isNext = numOffset + limit < Allorders.length;
  const isPre = numOffset > 0;
  
  const result = {
    data: orders,
    paging: {
      offset: numOffset,
      limit: numLimit,
      totalPage: Allorders.length/numLimit,
      isNext,
      isPre,
    },
  };
  

  return res.json(result);
};

export const getDetailOrder = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByPk(orderId);
  if(!order){
    throw new Error(ERROR_ORDER_NOT_FOUND)
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
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt", "orderId", "productId"] },
  });

  const customerInfo = await Customer.findByPk(order.customerId, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });

  const result = {
    data: {
      orderId: order.orderId,
      orderDiscountRate: order.orderDiscountRate,
      totalAmount: order.totalAmount,
      status: order.status,
      deliveryDate: order.deliveryDate,
      orderDate: order.orderDate,
      customer: customerInfo,
      products: products,
    },
  };

  return res.json(result);
};

export const createOrder = async (req, res, next) => {
  const {
    orderDiscountRate,
    status,
    deliveryDate,
    orderDate,
    customerId,
    products,
  } = req.body;

  if(products.length<=0){
    throw new Error(ERROR_AT_LEAST_ONE_PRODUCT_IN_ORDER)
  }
  let totalAmount = 0;
  const listOrderProduct = await Promise.all(
    products.map(async (product) => {
      const { productId, productDiscountRate, quantity } = product;
      const realProduct = await Product.findByPk(productId, {
        attributes: ["quantity", "price"],
      });

      if (quantity < 0 || quantity > realProduct.quantity) {
        throw new Error(ERROR_QUANTITY_NOT_ENOUGH)
      }

      const amount = realProduct.price * productDiscountRate;
      totalAmount += amount;

      return {
        productId,
        amount,
        productDiscountRate,
        quantity,
      };
    })
  );

  //create order
  const order = await Order.create({
    orderDiscountRate,
    totalAmount: totalAmount * orderDiscountRate,
    status,
    deliveryDate,
    customerId,
  });
  if (order) {
    listOrderProduct.forEach((item) => {
      item["orderId"] = order.orderId;
    });
    await OrderProduct.bulkCreate(listOrderProduct);
  }

  //update quanity product
  updateQuantityProduct(products, false);
  return res.json({ data: { result: true } });
};

function updateQuantityProduct(products, isIncrease) {
  const operator = isIncrease ? "+" : "-";
  //update quanity product
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
  if(!order){
    throw new Error(ERROR_ORDER_NOT_FOUND)
  }
  const products = await OrderProduct.findAll({
    where: {
      orderId
    },
    attributes:["quantity","productId"]
  })
  await OrderProduct.destroy({
    where: {
      orderId,
    },
  });
  //update quantity
  updateQuantityProduct(products,true)
  await Order.destroy({
    where: {
      orderId,
    },
  });
  return res.json({ data: { result: true } });
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
  if(!order){
    throw new Error(ERROR_ORDER_NOT_FOUND)
  }
    // Update order products
    if (products && products.length > 0) {
      await Promise.all(
        products.map(async (product) => {
          const { productId, quantity, productDiscountRate } = product;
          const realProduct = await Product.findByPk(productId,{attributes:["quantity","price"]})
          const oldOrderProduct = await OrderProduct.findOne({
            where:{
              orderId,
              productId
            },
            attributes: ["quantity","productDiscountRate"]
          }) 

          const nowProductDiscountRate = productDiscountRate?productDiscountRate: oldOrderProduct.productDiscountRate
          const amount= quantity*nowProductDiscountRate*realProduct.price
          
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
          if(quantity!== undefined){
            const newQuantity = oldOrderProduct.quantity?oldOrderProduct.quantity-quantity:-quantity;
            
            //update quantity
            await Product.update(
              {
                quantity: Sequelize.literal(
                  `"quantity" + ${newQuantity}`
                ),
              },
              {
                where: {
                  productId: product.productId,
                },
              }
            );
          }
        })
      );
    }
    const updateObject = {};
    if (customerId !== undefined && customerId !== null) {
      updateObject.customerId = customerId;
    }
    if (status !== undefined && status !== null) {
      updateObject.status = status;
    }
    if (deliveryDate !== undefined && deliveryDate !== null) {
      updateObject.deliveryDate = deliveryDate;
    }
    if (orderDate !== undefined && orderDate !== null) {
      updateObject.orderDate = orderDate;
    }
  
    if (orderDiscountRate !== undefined && orderDiscountRate !== null) {
      updateObject.orderDiscountRate = orderDiscountRate;
    }
   
    if (Object.keys(updateObject).length > 0||products.length>0) {
      const totalAmount = await computeTotalAmountOrder(orderId)

      if(totalAmount){
        const order = await Order.update({...updateObject,
          totalAmount,
          updatedAt: Sequelize.literal('CURRENT_TIMESTAMP')
        }, {
          where: {
            orderId,
          },
        });
        return res.json({ data: { result: true } });
      }
      
  }
};


async function computeTotalAmountOrder(orderId){
  let totalAmount = 0;
  const order = await Order.findByPk(orderId,{attributes:["orderDiscountRate"]})

  const orderProducts = await OrderProduct.findAll({
    where: {orderId},
    attributes: ["amount"],
  });
 
  if(orderProducts){
    orderProducts.forEach((element)=>{
      totalAmount += Number(element.amount)
     })
  } 

  return totalAmount*order.orderDiscountRate 
}
