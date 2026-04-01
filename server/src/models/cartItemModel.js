import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const cartItemModel = connection.define(
  "CartItem",
  {
    cart_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "carts",
        key: "cart_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "product_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "cart_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["cart_id", "product_id"],
      },
    ],
  },
);

export default cartItemModel;
