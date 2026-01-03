import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class AttendanceService {
  /**
   * Normalize date to start of day (00:00:00)
   * @param {Date} date - Date to normalize
   * @returns {Date} Normalized date
   */
  normalizeDate(date) {
    const normalized = new Date(date);
    // Use UTC to avoid timezone issues
    const year = normalized.getFullYear();
    const month = normalized.getMonth();
    const day = normalized.getDate();
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  /**
   * Calculate attendance status based on check-in and check-out times
   * @param {Date} checkIn - Check-in time
   * @param {Date} checkOut - Check-out time
   * @returns {String} Attendance status
   */
  calculateStatus(checkIn, checkOut) {
    if (!checkIn) {
      return "ABSENT";
    }

    if (!checkOut) {
      return "HALF_DAY";
    }

    // Calculate hours worked
    const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);

    if (hoursWorked >= 8) {
      return "PRESENT";
    } else if (hoursWorked >= 4) {
      return "HALF_DAY";
    } else {
      return "ABSENT";
    }
  }

  /**
   * Employee check-in
   * @param {String} userId - User ID
   * @returns {Object} Attendance record
   */
  async checkIn(userId) {
    try {
      const today = this.normalizeDate(new Date());
      const now = new Date();

      // Check if already checked in today
      const existingAttendance = await Attendance.findOne({
        user: userId,
        date: today,
      });

      if (existingAttendance) {
        if (existingAttendance.checkIn) {
          throw new APIError(400, "Already checked in today");
        }
      }

      // Create or update attendance record
      const attendance = await Attendance.findOneAndUpdate(
        { user: userId, date: today },
        {
          $set: {
            checkIn: now,
            status: "HALF_DAY", // Default to HALF_DAY until check-out
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).populate("user", "name email employeeId");

      return attendance;
    } catch (error) {
      logger.error("Error in checkIn service:", error);
      throw error;
    }
  }

  /**
   * Employee check-out
   * @param {String} userId - User ID
   * @returns {Object} Attendance record
   */
  async checkOut(userId) {
    try {
      const today = this.normalizeDate(new Date());
      const now = new Date();

      // Find today's attendance record
      const attendance = await Attendance.findOne({
        user: userId,
        date: today,
      });

      if (!attendance) {
        throw new APIError(400, "No check-in found for today. Please check in first.");
      }

      if (!attendance.checkIn) {
        throw new APIError(400, "Cannot check out without checking in first");
      }

      if (attendance.checkOut) {
        throw new APIError(400, "Already checked out today");
      }

      // Update check-out and calculate status
      attendance.checkOut = now;
      attendance.status = this.calculateStatus(attendance.checkIn, now);
      await attendance.save();

      await attendance.populate("user", "name email employeeId");

      return attendance;
    } catch (error) {
      logger.error("Error in checkOut service:", error);
      throw error;
    }
  }

  /**
   * Get employee's own attendance records
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Object} Attendance records with pagination
   */
  async getMyAttendance(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        status,
        page = 1,
        limit = 30,
      } = filters;

      const query = { user: userId };

      console.log('🔍 getMyAttendance - userId:', userId, 'filters:', filters);

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = this.normalizeDate(startDate);
        }
        if (endDate) {
          query.date.$lte = this.normalizeDate(endDate);
        }
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      console.log('🔍 getMyAttendance - final query:', query);

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        Attendance.find(query)
          .populate("user", "name email employeeId")
          .populate("markedBy", "name email")
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit),
        Attendance.countDocuments(query),
      ]);

      console.log('📊 getMyAttendance results - count:', records.length, 'total:', total);
      console.log('📊 Records:', JSON.stringify(records, null, 2));

      return {
        records,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error in getMyAttendance service:", error);
      throw error;
    }
  }

  /**
   * Get all employee attendance records (HR only)
   * @param {Object} filters - Query filters
   * @returns {Object} Attendance records with pagination
   */
  async getAllAttendance(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        status,
        page = 1,
        limit = 30,
      } = filters;

      const query = {};

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = this.normalizeDate(startDate);
        }
        if (endDate) {
          query.date.$lte = this.normalizeDate(endDate);
        }
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        Attendance.find(query)
          .populate("user", "name email employeeId")
          .populate("markedBy", "name email")
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit),
        Attendance.countDocuments(query),
      ]);

      return {
        records,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error in getAllAttendance service:", error);
      throw error;
    }
  }

  /**
   * Get attendance records for a specific user (HR only)
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Object} Attendance records with pagination
   */
  async getAttendanceByUserId(userId, filters = {}) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      return await this.getMyAttendance(userId, filters);
    } catch (error) {
      logger.error("Error in getAttendanceByUserId service:", error);
      throw error;
    }
  }

  /**
   * Update attendance record (HR only)
   * @param {String} attendanceId - Attendance ID
   * @param {Object} updateData - Update data
   * @param {String} hrUserId - HR user ID
   * @returns {Object} Updated attendance record
   */
  async updateAttendance(attendanceId, updateData, hrUserId) {
    try {
      const attendance = await Attendance.findById(attendanceId);

      if (!attendance) {
        throw new APIError(404, "Attendance record not found");
      }

      // Update fields
      if (updateData.checkIn !== undefined) {
        attendance.checkIn = updateData.checkIn;
      }

      if (updateData.checkOut !== undefined) {
        attendance.checkOut = updateData.checkOut;
      }

      if (updateData.status !== undefined) {
        attendance.status = updateData.status;
      } else {
        // Recalculate status if times changed but status not provided
        attendance.status = this.calculateStatus(
          attendance.checkIn,
          attendance.checkOut
        );
      }

      if (updateData.remarks !== undefined) {
        attendance.remarks = updateData.remarks;
      }

      // Mark who updated this record
      attendance.markedBy = hrUserId;

      await attendance.save();

      await attendance.populate([
        { path: "user", select: "name email employeeId" },
        { path: "markedBy", select: "name email" },
      ]);

      return attendance;
    } catch (error) {
      logger.error("Error in updateAttendance service:", error);
      throw error;
    }
  }

  /**
   * Create attendance record manually (HR only)
   * @param {Object} data - Attendance data
   * @param {String} hrUserId - HR user ID
   * @returns {Object} Created attendance record
   */
  async createAttendance(data, hrUserId) {
    try {
      const { userId, date, checkIn, checkOut, status, remarks } = data;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      const normalizedDate = this.normalizeDate(date);

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        user: userId,
        date: normalizedDate,
      });

      if (existingAttendance) {
        throw new APIError(409, "Attendance record already exists for this date");
      }

      // Determine status
      const finalStatus = status || this.calculateStatus(checkIn, checkOut);

      // Create attendance record
      const attendance = await Attendance.create({
        user: userId,
        date: normalizedDate,
        checkIn,
        checkOut,
        status: finalStatus,
        remarks,
        markedBy: hrUserId,
      });

      await attendance.populate([
        { path: "user", select: "name email employeeId" },
        { path: "markedBy", select: "name email" },
      ]);

      return attendance;
    } catch (error) {
      logger.error("Error in createAttendance service:", error);
      throw error;
    }
  }

  /**
   * Delete attendance record (HR only)
   * @param {String} attendanceId - Attendance ID
   * @returns {Object} Deleted attendance record
   */
  async deleteAttendance(attendanceId) {
    try {
      const attendance = await Attendance.findByIdAndDelete(attendanceId);

      if (!attendance) {
        throw new APIError(404, "Attendance record not found");
      }

      return attendance;
    } catch (error) {
      logger.error("Error in deleteAttendance service:", error);
      throw error;
    }
  }
}

export default new AttendanceService();
