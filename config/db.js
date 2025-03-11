const { Pool } = require("pg");
// require("dotenv").config();

const pool = new Pool({
  connectionString: "postgresql://navruz_q9xl_user:bDIuo4xc2XdPivyeRrXsray8SK9T4g6F@dpg-cv4k0vdds78s73dvliq0-a.oregon-postgres.render.com/navruz_q9xl",
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
});

module.exports = pool;
