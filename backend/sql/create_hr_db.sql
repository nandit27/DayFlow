-- Create a database for HR Management and core tables
-- This script is for SQL Server (T-SQL). It avoids using GO so it can be executed by Node `mssql` driver.

IF DB_ID(N'hr_management') IS NULL
BEGIN
    CREATE DATABASE [hr_management];
END

USE [hr_management];

-- Departments
IF OBJECT_ID('dbo.Departments') IS NULL
BEGIN
    CREATE TABLE dbo.Departments (
        DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(250) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END

-- Roles
IF OBJECT_ID('dbo.Roles') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(250) NULL
    );
END

-- Employees
IF OBJECT_ID('dbo.Employees') IS NULL
BEGIN
    CREATE TABLE dbo.Employees (
        EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeNumber NVARCHAR(20) NOT NULL UNIQUE,
        FirstName NVARCHAR(100) NOT NULL,
        MiddleName NVARCHAR(100) NULL,
        LastName NVARCHAR(100) NOT NULL,
        DateOfBirth DATE NULL,
        Gender NVARCHAR(20) NULL,
        Email NVARCHAR(255) NULL,
        Phone NVARCHAR(50) NULL,
        HireDate DATE NULL,
        DepartmentId INT NULL,
        ManagerId INT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Employees_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
        CONSTRAINT FK_Employees_Manager FOREIGN KEY (ManagerId) REFERENCES dbo.Employees(EmployeeId)
    );
END

-- EmployeeRoles (many-to-many)
IF OBJECT_ID('dbo.EmployeeRoles') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeeRoles (
        EmployeeRoleId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        RoleId INT NOT NULL,
        AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_EmpRoles_Employees FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId),
        CONSTRAINT FK_EmpRoles_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId)
    );
END

-- Addresses
IF OBJECT_ID('dbo.Addresses') IS NULL
BEGIN
    CREATE TABLE dbo.Addresses (
        AddressId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        AddressLine1 NVARCHAR(250) NULL,
        AddressLine2 NVARCHAR(250) NULL,
        City NVARCHAR(100) NULL,
        State NVARCHAR(100) NULL,
        PostalCode NVARCHAR(50) NULL,
        Country NVARCHAR(100) NULL,
        AddressType NVARCHAR(50) NULL,
        CONSTRAINT FK_Addresses_Employees FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId)
    );
END

-- Salaries / Compensation history
IF OBJECT_ID('dbo.Salaries') IS NULL
BEGIN
    CREATE TABLE dbo.Salaries (
        SalaryId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        BaseSalary DECIMAL(18,2) NOT NULL,
        Currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        CONSTRAINT FK_Salaries_Employees FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId)
    );
END

-- Leave requests
IF OBJECT_ID('dbo.LeaveRequests') IS NULL
BEGIN
    CREATE TABLE dbo.LeaveRequests (
        LeaveId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        LeaveType NVARCHAR(50) NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
        Reason NVARCHAR(500) NULL,
        AppliedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Leave_Employees FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId)
    );
END

-- Attendance
IF OBJECT_ID('dbo.Attendance') IS NULL
BEGIN
    CREATE TABLE dbo.Attendance (
        AttendanceId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        [Date] DATE NOT NULL,
        CheckIn DATETIME2 NULL,
        CheckOut DATETIME2 NULL,
        WorkMinutes AS DATEDIFF(MINUTE, CheckIn, CheckOut) PERSISTED,
        CONSTRAINT FK_Attendance_Employees FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId)
    );
END

-- Simple seed data (departments, roles, and a sample employee)
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = 'Human Resources')
    INSERT INTO dbo.Departments (Name, Description) VALUES ('Human Resources', 'HR Department');

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = 'Administrator')
    INSERT INTO dbo.Roles (Name, Description) VALUES ('Administrator', 'System administrator role');

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE EmployeeNumber = 'EMP0001')
BEGIN
    INSERT INTO dbo.Employees (EmployeeNumber, FirstName, LastName, Email, HireDate, DepartmentId)
    VALUES ('EMP0001', 'Admin', 'User', 'admin@example.com', GETDATE(), (SELECT DepartmentId FROM dbo.Departments WHERE Name='Human Resources'));

    DECLARE @empId INT = SCOPE_IDENTITY();
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId) VALUES (@empId, (SELECT RoleId FROM dbo.Roles WHERE Name='Administrator'));
END

-- End of script
