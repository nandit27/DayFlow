# od oogecet - backend

This folder contains a minimal Node.js backend with SQL Server connectivity using `mssql`.

Files created:
- `app.js` - Express server with `/test-db` endpoint
- `db.js` - mssql connection helper
- `test-connection.js` - CLI script to test DB connection
- `package.json` - dependencies and scripts
- `.env.example` - example environment variables
- `sql/create_hr_db.sql` - T-SQL script to create `hr_management` DB and HR-related tables
- `run-sql.js` - small Node runner that executes the SQL script using env settings
- `.gitignore`

Quick start (PowerShell):

```powershell
cd d:/Degree/odoogecet/backend
# Install dependencies
npm install
# Create a .env file based on .env.example and fill values
copy .env.example .env
# If you want the script to create a new database named 'hr_management', ensure your DB user can create databases.
# To use a LocalDB instance (SQL Server Express LocalDB), set DB_HOST to '(localdb)\\MSSQLLocalDB' and leave DB_PORT blank.
# Example .env overrides:
# DB_HOST=(localdb)\\MSSQLLocalDB
# DB_USER=<your_windows_user_or_sa>
# DB_PASSWORD=<your_password_if_using_sql_auth>
# DB_NAME=master

# Run the SQL creation script (this executes sql/create_hr_db.sql):
node run-sql.js

# Test connection (optional):
npm run test-connection

# Start server:
npm start
# Then open http://localhost:3000/test-db to see a quick query
```

Notes:
- The `run-sql.js` runner splits batches by `GO` lines. The provided SQL script avoids `GO` to keep it compatible with the Node runner.
- The T-SQL script creates a database named `hr_management` (if it doesn't exist) and the following tables: `Departments`, `Roles`, `Employees`, `EmployeeRoles`, `Addresses`, `Salaries`, `LeaveRequests`, `Attendance`.
- For LocalDB use: set `DB_HOST=(localdb)\\MSSQLLocalDB`. The runner will parse the instance name and set `options.instanceName` for the driver.
- If your SQL Server uses Windows Authentication and you are running Node as the same Windows user, you can omit `DB_USER`/`DB_PASSWORD` and configure the driver to use integrated auth (that requires additional packages and configuration). For simplicity the project uses SQL auth by default in examples.
- If you want me to run the script from this environment and test the database, provide connection details or confirm that a local DB instance is available and accessible from this workspace.
