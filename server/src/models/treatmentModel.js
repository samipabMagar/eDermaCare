import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const treatmentModel = connection.define(
  "Treatment",
  {
    treatment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(140),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "treatments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default treatmentModel;
