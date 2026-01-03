const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => res.json({ message: 'odoogecet backend running' }));

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
