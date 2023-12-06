import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class OrderProduct extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'orders',
        key: 'order_id'
      },
      field: 'order_id'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'product_id'
      },
      field: 'product_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    productDiscountRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'product_discount_rate'
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order_product',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "order_product_pkey",
        unique: true,
        fields: [
          { name: "order_id" },
          { name: "product_id" },
        ]
      },
    ]
  });
  }
}
