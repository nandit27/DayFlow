const express = require('express');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.json({message: 'odoogecet backend running'}));

app.get('/test-db', async (req, res) => {
  try {
    const pool = await db.getPool();
    const result = await pool.request().query('SELECT 1 AS number');
    res.json({ success: true, rows: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
