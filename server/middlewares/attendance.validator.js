import { z } from "zod";

// Check-in validation
export const checkInSchema = z.object({
  // No body needed - uses current timestamp
});

// Check-out validation
export const checkOutSchema = z.object({
  // No body needed - uses current timestamp
});

// HR attendance update validation
export const hrUpdateAttendanceSchema = z.object({
  checkIn: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  checkOut: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]).optional(),
  remarks: z.string().trim().optional(),
});

// HR manual attendance creation
export const hrCreateAttendanceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z.string().min(1, "Date is required").transform((val) => new Date(val)),
  checkIn: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  checkOut: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]),
  remarks: z.string().trim().optional(),
});

// Query params for fetching attendance
export const attendanceQuerySchema = z.object({
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]).optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 30),
});
