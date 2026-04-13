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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    image_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      validate: {
        isValidImageUrl(value) {
          if (!value) return;

          const isLocalUploadPath =
            value.startsWith("uploads/") || value.startsWith("/uploads/");

          if (isLocalUploadPath) {
            return;
          }

          const isAbsoluteHttpUrl = /^https?:\/\//i.test(value);

          if (!isAbsoluteHttpUrl) {
            throw new Error(
              "image_url must be a valid URL or a local uploads path",
            );
          }
        },
      },
    },
    benefit_tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
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
