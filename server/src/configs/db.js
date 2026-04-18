import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Create a new Sequelize instance with the database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    pool: {
      max: 5,
    },
  },
);

export default sequelize;
