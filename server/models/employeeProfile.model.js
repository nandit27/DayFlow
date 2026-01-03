import mongoose from "mongoose";

const employeeProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Personal Information
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    // Job Information
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Intern", "Contract"],
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Salary Structure (Editable by HR only)
    salary: {
      basic: {
        type: Number,
        default: 0,
      },
      hra: {
        type: Number,
        default: 0,
      },
      allowances: {
        type: Number,
        default: 0,
      },
      deductions: {
        type: Number,
        default: 0,
      },
    },
    // Documents
    documents: [
      {
        type: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Leave Allocation
    leaveAllocation: {
      PAID: {
        type: Number,
        default: 24,
      },
      SICK: {
        type: Number,
        default: 7,
      },
      CASUAL: {
        type: Number,
        default: 12,
      },
      UNPAID: {
        type: Number,
        default: 0,
      },
    },
    // Meta
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
employeeProfileSchema.index({ user: 1 });
employeeProfileSchema.index({ department: 1 });
employeeProfileSchema.index({ isActive: 1 });

const EmployeeProfile = mongoose.model("EmployeeProfile", employeeProfileSchema);

export default EmployeeProfile;
