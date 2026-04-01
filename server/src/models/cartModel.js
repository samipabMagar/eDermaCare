import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const cartModel = connection.define(
  "Cart",
  {
    cart_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default cartModel;
