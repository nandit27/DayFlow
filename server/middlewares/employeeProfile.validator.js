import { z } from "zod";

// Document schema
const documentSchema = z.object({
  type: z.string().trim().min(1, "Document type is required"),
  url: z.string().trim().url("Invalid document URL"),
  uploadedAt: z.date().optional(),
});

// Salary schema
const salarySchema = z.object({
  basic: z.number().min(0, "Basic salary must be non-negative").optional(),
  hra: z.number().min(0, "HRA must be non-negative").optional(),
  allowances: z.number().min(0, "Allowances must be non-negative").optional(),
  deductions: z.number().min(0, "Deductions must be non-negative").optional(),
});

// Employee can only edit these fields
export const employeeUpdateSchema = z.object({
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
  documents: z.array(documentSchema).optional(),
});

// HR can edit all fields
export const hrUpdateSchema = z.object({
  // Personal Information
  address: z.string().trim().optional(),
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  emergencyContact: z.string().trim().optional(),
  
  // Job Information
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  joiningDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  employmentType: z.enum(["Full-time", "Part-time", "Intern", "Contract"]).optional(),
  reportingManager: z.string().optional(),
  
  // Salary Structure
  salary: salarySchema.optional(),
  
  // Documents
  documents: z.array(documentSchema).optional(),
  
  // Meta
  isActive: z.boolean().optional(),
});

// Create profile schema (HR only)
export const createProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  
  // Personal Information
  address: z.string().trim().optional(),
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  emergencyContact: z.string().trim().optional(),
  
  // Job Information
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  joiningDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  employmentType: z.enum(["Full-time", "Part-time", "Intern", "Contract"]).optional(),
  reportingManager: z.string().optional(),
  
  // Salary Structure
  salary: salarySchema.optional(),
  
  // Documents
  documents: z.array(documentSchema).optional(),
  
  // Meta
  isActive: z.boolean().optional(),
});
