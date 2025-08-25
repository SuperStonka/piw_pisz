import mysql from "mysql2/promise";

// Use the same database configuration as the main application
export const dbConfig = {
  host: "arstudio.atthost24.pl",
  user: "9518_piwpisz",
  password: "Rs75Nz#$UB65@",
  database: "9518_piwpisz",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const createDB = () => mysql.createPool(dbConfig);
