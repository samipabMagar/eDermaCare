import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const orderItemModel = connection.define(
  "OrderItem",
  {
    order_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "order_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "products",
        key: "product_id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    product_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    line_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default orderItemModel;
