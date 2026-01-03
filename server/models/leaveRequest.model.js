import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["PAID", "SICK", "UNPAID", "CASUAL"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      trim: true,
    },
    // Approval Workflow
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewerComment: {
      type: String,
      trim: true,
    },
    // Meta
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
leaveRequestSchema.index({ user: 1, startDate: 1 });
leaveRequestSchema.index({ status: 1, createdAt: -1 });

// Index for date range queries
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;
