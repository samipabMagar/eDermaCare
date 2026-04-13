import connection from "../configs/db.js";
import { DataTypes } from "sequelize";

const treatmentAppointmentModel = connection.define(
  "TreatmentAppointment",
  {
    treatment_appointment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "treatments",
        key: "treatment_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    session_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reminder_frequency: {
      type: DataTypes.ENUM("weekly", "monthly"),
      allowNull: false,
      defaultValue: "weekly",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    user_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_reminder_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "treatment_appointments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default treatmentAppointmentModel;
