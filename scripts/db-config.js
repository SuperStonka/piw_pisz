import mysql from "mysql2/promise";

// Use the same database configuration as the main application
export const dbConfig = {
  host: process.env.DB_HOST || "arstudio.atthost24.pl",
  user: process.env.DB_USER || "9518_piwpisz",
  password: process.env.DB_PASSWORD || "Rs75Nz#$UB65@",
  database: process.env.DB_NAME || "9518_piwpisz",
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const createDB = () => mysql.createPool(dbConfig);
