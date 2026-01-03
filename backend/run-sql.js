const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

const sqlFile = path.join(__dirname, 'sql', 'create_hr_db.sql');

function splitBatches(script) {
  // Split on lines that contain only GO (case-insensitive)
  return script
    .split(/\r?\n/)
    .reduce((acc, line) => {
      if (/^\s*GO\s*$/i.test(line)) {
        acc.push('\n');
      } else {
        if (acc.length === 0) acc.push('');
        acc[acc.length - 1] += line + '\n';
      }
      return acc;
    }, [])
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function run() {
  try {
    const script = fs.readFileSync(sqlFile, 'utf8');
    const batches = splitBatches(script);

    const config = {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
      server: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || undefined,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      options: {
        trustServerCertificate: true,
        enableArithAbort: true
      }
    };

    // If using a named instance (e.g. (localdb)\\MSSQLLocalDB), set instanceName
    if ((process.env.DB_HOST || '').includes('\\')) {
      config.server = (process.env.DB_HOST || '').split('\\')[0];
      config.options.instanceName = (process.env.DB_HOST || '').split('\\')[1];
    }

    console.log('Connecting with config:', {
      server: config.server,
      instanceName: config.options && config.options.instanceName,
      database: config.database
    });

    const pool = await sql.connect(config);

    for (const batch of batches) {
      console.log('Executing batch...');
      await pool.request().batch(batch);
    }

    console.log('Script executed successfully.');
    await pool.close();
  } catch (err) {
    console.error('Failed to execute script:', err.message || err);
    process.exit(1);
  }
}

run();
