import LeaveRequest from "../models/leaveRequest.model.js";
import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import EmployeeProfile from "../models/employeeProfile.model.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class LeaveService {
  /**
   * Normalize date to start of day (00:00:00)
   * @param {Date} date - Date to normalize
   * @returns {Date} Normalized date
   */
  normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Calculate total days between start and end date (inclusive)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Number} Total days
   */
  calculateTotalDays(startDate, endDate) {
    const start = this.normalizeDate(startDate);
    const end = this.normalizeDate(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end date
  }

  /**
   * Get all dates between start and end date (inclusive)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of dates
   */
  getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = this.normalizeDate(startDate);
    const end = this.normalizeDate(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.setDate() + 1);
    }

    return dates;
  }

  /**
   * Check for overlapping leave requests
   * @param {String} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {String} excludeLeaveId - Leave ID to exclude from check
   * @returns {Boolean} True if overlap exists
   */
  async checkOverlap(userId, startDate, endDate, excludeLeaveId = null) {
    try {
      const query = {
        user: userId,
        status: { $in: ["PENDING", "APPROVED"] },
        $or: [
          // New leave starts during existing leave
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
          // New leave ends during existing leave
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
          // New leave encompasses existing leave
          { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
        ],
      };

      if (excludeLeaveId) {
        query._id = { $ne: excludeLeaveId };
      }

      const overlappingLeave = await LeaveRequest.findOne(query);
      return overlappingLeave !== null;
    } catch (error) {
      logger.error("Error in checkOverlap:", error);
      throw error;
    }
  }

  /**
   * Sync approved leave with attendance records
   * @param {String} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {String} hrUserId - HR user ID who approved
   */
  async syncLeaveWithAttendance(userId, startDate, endDate, hrUserId) {
    try {
      const start = this.normalizeDate(startDate);
      const end = this.normalizeDate(endDate);
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateToMark = new Date(currentDate);

        // Check if attendance exists for this date
        const existingAttendance = await Attendance.findOne({
          user: userId,
          date: dateToMark,
        });

        if (existingAttendance) {
          // Only update if status is ABSENT or not set
          if (existingAttendance.status === "ABSENT" || !existingAttendance.status) {
            existingAttendance.status = "LEAVE";
            existingAttendance.markedBy = hrUserId;
            await existingAttendance.save();
          }
        } else {
          // Create new attendance record with LEAVE status
          await Attendance.create({
            user: userId,
            date: dateToMark,
            status: "LEAVE",
            markedBy: hrUserId,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      logger.error("Error in syncLeaveWithAttendance:", error);
      throw error;
    }
  }

  /**
   * Apply for leave (Employee)
   * @param {String} userId - User ID
   * @param {Object} leaveData - Leave application data
   * @returns {Object} Created leave request
   */
  async applyLeave(userId, leaveData) {
    try {
      const { leaveType, startDate, endDate, reason } = leaveData;

      const normalizedStartDate = this.normalizeDate(startDate);
      const normalizedEndDate = this.normalizeDate(endDate);
      const today = this.normalizeDate(new Date());

      // Validate: Cannot apply leave for past dates
      if (normalizedStartDate < today) {
        throw new APIError(400, "Cannot apply leave for past dates");
      }

      // Validate: Start date must be <= end date
      if (normalizedStartDate > normalizedEndDate) {
        throw new APIError(400, "Start date must be less than or equal to end date");
      }

      // Check for overlapping leave
      const hasOverlap = await this.checkOverlap(
        userId,
        normalizedStartDate,
        normalizedEndDate
      );

      if (hasOverlap) {
        throw new APIError(
          409,
          "Leave request overlaps with existing pending or approved leave"
        );
      }

      // Calculate total days
      const totalDays = this.calculateTotalDays(
        normalizedStartDate,
        normalizedEndDate
      );

      // Create leave request
      const leaveRequest = await LeaveRequest.create({
        user: userId,
        leaveType,
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        totalDays,
        reason,
        status: "PENDING",
      });

      await leaveRequest.populate("user", "name email employeeId");

      return leaveRequest;
    } catch (error) {
      logger.error("Error in applyLeave service:", error);
      throw error;
    }
  }

  /**
   * Get employee's own leave requests
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Object} Leave requests with pagination
   */
  async getMyLeaves(userId, filters = {}) {
    try {
      const { status, leaveType, startDate, endDate, page = 1, limit = 20 } = filters;

      const query = { user: userId };

      // Status filter
      if (status) {
        query.status = status;
      }

      // Leave type filter
      if (leaveType) {
        query.leaveType = leaveType;
      }

      // Date range filter
      if (startDate || endDate) {
        query.$and = query.$and || [];
        if (startDate) {
          query.$and.push({ startDate: { $gte: this.normalizeDate(startDate) } });
        }
        if (endDate) {
          query.$and.push({ endDate: { $lte: this.normalizeDate(endDate) } });
        }
      }

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        LeaveRequest.find(query)
          .populate("user", "name email employeeId")
          .populate("reviewedBy", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LeaveRequest.countDocuments(query),
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
      logger.error("Error in getMyLeaves service:", error);
      throw error;
    }
  }

  /**
   * Get all leave requests (HR only)
   * @param {Object} filters - Query filters
   * @returns {Object} Leave requests with pagination
   */
  async getAllLeaves(filters = {}) {
    try {
      const { status, leaveType, startDate, endDate, page = 1, limit = 20 } = filters;

      const query = {};

      // Status filter
      if (status) {
        query.status = status;
      }

      // Leave type filter
      if (leaveType) {
        query.leaveType = leaveType;
      }

      // Date range filter
      if (startDate || endDate) {
        query.$and = query.$and || [];
        if (startDate) {
          query.$and.push({ startDate: { $gte: this.normalizeDate(startDate) } });
        }
        if (endDate) {
          query.$and.push({ endDate: { $lte: this.normalizeDate(endDate) } });
        }
      }

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        LeaveRequest.find(query)
          .populate("user", "name email employeeId")
          .populate("reviewedBy", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LeaveRequest.countDocuments(query),
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
      logger.error("Error in getAllLeaves service:", error);
      throw error;
    }
  }

  /**
   * Approve leave request (HR only)
   * @param {String} leaveId - Leave request ID
   * @param {String} hrUserId - HR user ID
   * @param {String} reviewerComment - Optional comment
   * @returns {Object} Updated leave request
   */
  async approveLeave(leaveId, hrUserId, reviewerComment = "") {
    try {
      const leaveRequest = await LeaveRequest.findById(leaveId);

      if (!leaveRequest) {
        throw new APIError(404, "Leave request not found");
      }

      // Cannot approve already processed leave
      if (leaveRequest.status !== "PENDING") {
        throw new APIError(
          400,
          `Leave request is already ${leaveRequest.status.toLowerCase()}`
        );
      }

      // Deduct leave allocation from employee profile
      const employeeProfile = await EmployeeProfile.findOne({ user: leaveRequest.user });
      if (employeeProfile && employeeProfile.leaveAllocation) {
        const leaveType = leaveRequest.leaveType;
        const totalDays = leaveRequest.totalDays;
        
        // Check if employee has enough leave balance
        if (employeeProfile.leaveAllocation[leaveType] !== undefined) {
          if (employeeProfile.leaveAllocation[leaveType] < totalDays) {
            throw new APIError(400, `Insufficient ${leaveType} leave balance. Available: ${employeeProfile.leaveAllocation[leaveType]}, Requested: ${totalDays}`);
          }
          
          // Deduct the leave days
          employeeProfile.leaveAllocation[leaveType] -= totalDays;
          await employeeProfile.save();
        }
      }

      // Update leave request
      leaveRequest.status = "APPROVED";
      leaveRequest.reviewedBy = hrUserId;
      leaveRequest.reviewedAt = new Date();
      leaveRequest.reviewerComment = reviewerComment;

      await leaveRequest.save();

      // Sync with attendance module
      await this.syncLeaveWithAttendance(
        leaveRequest.user,
        leaveRequest.startDate,
        leaveRequest.endDate,
        hrUserId
      );

      await leaveRequest.populate([
        { path: "user", select: "name email employeeId" },
        { path: "reviewedBy", select: "name email" },
      ]);

      return leaveRequest;
    } catch (error) {
      logger.error("Error in approveLeave service:", error);
      throw error;
    }
  }

  /**
   * Reject leave request (HR only)
   * @param {String} leaveId - Leave request ID
   * @param {String} hrUserId - HR user ID
   * @param {String} reviewerComment - Required comment
   * @returns {Object} Updated leave request
   */
  async rejectLeave(leaveId, hrUserId, reviewerComment) {
    try {
      const leaveRequest = await LeaveRequest.findById(leaveId);

      if (!leaveRequest) {
        throw new APIError(404, "Leave request not found");
      }

      // Cannot reject already processed leave
      if (leaveRequest.status !== "PENDING") {
        throw new APIError(
          400,
          `Leave request is already ${leaveRequest.status.toLowerCase()}`
        );
      }

      // Update leave request
      leaveRequest.status = "REJECTED";
      leaveRequest.reviewedBy = hrUserId;
      leaveRequest.reviewedAt = new Date();
      leaveRequest.reviewerComment = reviewerComment;

      await leaveRequest.save();

      await leaveRequest.populate([
        { path: "user", select: "name email employeeId" },
        { path: "reviewedBy", select: "name email" },
      ]);

      return leaveRequest;
    } catch (error) {
      logger.error("Error in rejectLeave service:", error);
      throw error;
    }
  }

  /**
   * Delete leave request (Employee - only pending)
   * @param {String} leaveId - Leave request ID
   * @param {String} userId - User ID
   * @returns {Object} Deleted leave request
   */
  async deleteLeaveRequest(leaveId, userId) {
    try {
      const leaveRequest = await LeaveRequest.findById(leaveId);

      if (!leaveRequest) {
        throw new APIError(404, "Leave request not found");
      }

      // Verify ownership
      if (leaveRequest.user.toString() !== userId) {
        throw new APIError(403, "You can only delete your own leave requests");
      }

      // Can only delete pending requests
      if (leaveRequest.status !== "PENDING") {
        throw new APIError(
          400,
          "Cannot delete leave request that has been processed"
        );
      }

      await LeaveRequest.findByIdAndDelete(leaveId);

      return leaveRequest;
    } catch (error) {
      logger.error("Error in deleteLeaveRequest service:", error);
      throw error;
    }
  }
}

export default new LeaveService();
