import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Category extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    categoryId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'category_id'
    },
    categoryName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'category_name'
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
    tableName: 'categories',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "categories_pkey",
        unique: true,
        fields: [
          { name: "category_id" },
        ]
      },
    ]
  });
  }
}
