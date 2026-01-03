import { z } from "zod";

// Salary breakdown schema
const salarySchema = z.object({
  basic: z.number().min(0, "Basic salary must be non-negative"),
  hra: z.number().min(0, "HRA must be non-negative").optional(),
  allowances: z.number().min(0, "Allowances must be non-negative").optional(),
  deductions: z.number().min(0, "Deductions must be non-negative").optional(),
});

// Payroll creation validation
export const createPayrollSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format (e.g., 2026-01)"),
  year: z.number().int().min(2000).max(2100, "Year must be between 2000 and 2100"),
  salary: salarySchema,
  remarks: z.string().trim().optional(),
});

// Payroll update validation
export const updatePayrollSchema = z.object({
  salary: salarySchema.optional(),
  remarks: z.string().trim().optional(),
});

// Query parameters for fetching payroll
export const payrollQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format")
    .optional(),
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});
