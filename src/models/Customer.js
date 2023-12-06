import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Customer extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    customerId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'customer_id'
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'customer_name'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'phone_number'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'customers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "customers_pkey",
        unique: true,
        fields: [
          { name: "customer_id" },
        ]
      },
    ]
  });
  }
}
