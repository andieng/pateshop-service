import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Order extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    orderId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'order_id'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'customer_id'
      },
      field: 'customer_id'
    },
    orderDiscountRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'order_discount_rate'
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'total_amount'
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivery_date'
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'order_date'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'updated_at'
    }
  }, {
    sequelize,
    tableName: 'orders',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "orders_pkey",
        unique: true,
        fields: [
          { name: "order_id" },
        ]
      },
    ]
  });
  }
}
