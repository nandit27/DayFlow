import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"],
      default: "ABSENT",
    },
    remarks: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate attendance per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Index for efficient querying
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

// Method to normalize date to start of day
attendanceSchema.statics.normalizeDate = function (date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
