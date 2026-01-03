import { z } from "zod";

// Leave application validation
export const applyLeaveSchema = z.object({
  leaveType: z.enum(["PAID", "SICK", "UNPAID", "CASUAL"], {
    required_error: "Leave type is required",
    invalid_type_error: "Invalid leave type",
  }),
  startDate: z.string().min(1, "Start date is required").transform((val) => new Date(val)),
  endDate: z.string().min(1, "End date is required").transform((val) => new Date(val)),
  reason: z.string().trim().optional(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: "End date must be greater than or equal to start date",
    path: ["endDate"],
  }
);

// Leave approval validation
export const approveLeaveSchema = z.object({
  reviewerComment: z.string().trim().optional(),
});

// Leave rejection validation
export const rejectLeaveSchema = z.object({
  reviewerComment: z.string().trim().min(1, "Comment is required when rejecting leave"),
});

// Query parameters for fetching leave requests
export const leaveQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  leaveType: z.enum(["PAID", "SICK", "UNPAID", "CASUAL"]).optional(),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
});
