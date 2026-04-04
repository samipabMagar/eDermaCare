import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const appointmentModel = connection.define(
  "Appointment",
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    patient_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    doctor_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    meeting_provider: {
      type: DataTypes.ENUM("google_meet", "zoom"),
      allowNull: true,
    },

    meeting_link: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    doctor_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    patient_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    cancelled_by: {
      type: DataTypes.ENUM("patient", "doctor", "admin"),
      allowNull: true,
    },

    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "appointments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default appointmentModel;
