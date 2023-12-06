import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Product extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    productId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'product_id'
    },
    productSku: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "products_product_sku_key",
      field: 'product_sku'
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'product_name'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'category_id'
      },
      field: 'category_id'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    size: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    color: {
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
    tableName: 'products',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "products_pkey",
        unique: true,
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "products_product_sku_key",
        unique: true,
        fields: [
          { name: "product_sku" },
        ]
      },
    ]
  });
  }
}
