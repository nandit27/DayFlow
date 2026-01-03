const sql = require('mssql');
require('dotenv').config();

let pool;

async function getPool() {
  if (pool) {
    try {
      // mssql pool exposes connected property in some versions
      if (pool.connected) return pool;
    } catch (e) {}
  }

  const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'master',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };

  pool = await sql.connect(config);
  return pool;
}

module.exports = { getPool };
