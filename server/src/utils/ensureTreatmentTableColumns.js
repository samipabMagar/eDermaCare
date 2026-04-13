import { DataTypes } from "sequelize";
import connection from "../configs/db.js";

export const ensureTreatmentTableColumns = async () => {
  const queryInterface = connection.getQueryInterface();

  const tableExists = await queryInterface
    .describeTable("treatments")
    .then(() => true)
    .catch(() => false);

  if (!tableExists) {
    return;
  }

  const columns = await queryInterface.describeTable("treatments");

  if (!columns.image_url) {
    await queryInterface.addColumn("treatments", "image_url", {
      type: DataTypes.STRING(1024),
      allowNull: true,
    });
  }

  if (!columns.price) {
    await queryInterface.addColumn("treatments", "price", {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    });
  }

  if (!columns.benefit_tags) {
    await queryInterface.addColumn("treatments", "benefit_tags", {
      type: DataTypes.JSON,
      allowNull: true,
    });
  }

  if (!columns.duration_minutes) {
    await queryInterface.addColumn("treatments", "duration_minutes", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  }
};
