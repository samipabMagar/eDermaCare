import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const paymentModel = connection.define(
  "Payment",
  {
    payment_id: {
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

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    gateway: {
      type: DataTypes.ENUM("khalti", "esewa", "stripe"),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "initiated",
        "pending",
        "completed",
        "failed",
        "refunded",
      ),
      allowNull: false,
      defaultValue: "initiated",
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "NPR",
    },

    gateway_reference: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    transaction_id: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    initiated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    failed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default paymentModel;
