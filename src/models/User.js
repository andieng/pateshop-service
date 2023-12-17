import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class User extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    userId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'user_id'
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "users_username_key"
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
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
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "https:\/\/firebasestorage.googleapis.com\/v0\/b\/pate-shop.appspot.com\/o\/default-avatar.jpg?alt=media&token=47650302-c9be-41cd-bf8a-ba2e913efe19"
    }
  }, {
    sequelize,
    tableName: 'users',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "users_pkey",
        unique: true,
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "users_username_key",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
  }
}
