import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/, // Format: YYYY-MM
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    // Salary Breakdown
    salary: {
      basic: {
        type: Number,
        required: true,
        min: 0,
      },
      hra: {
        type: Number,
        default: 0,
        min: 0,
      },
      allowances: {
        type: Number,
        default: 0,
        min: 0,
      },
      deductions: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    // Calculations
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    // Meta
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate payroll per user per month
payrollSchema.index({ user: 1, month: 1 }, { unique: true });

// Index for efficient querying
payrollSchema.index({ year: -1, month: -1 });

// Virtual to get month-year display
payrollSchema.virtual("period").get(function () {
  return this.month;
});

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
