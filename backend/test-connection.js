const db = require('./db');

(async () => {
  try {
    console.log('Testing DB connection...');
    const pool = await db.getPool();
    const result = await pool.request().query('SELECT GETDATE() AS now');
    console.log('Connected. Sample row:', result.recordset[0]);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
})();
