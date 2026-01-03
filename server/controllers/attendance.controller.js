import attendanceService from "../services/attendance.service.js";
import {
  attendanceQuerySchema,
  hrUpdateAttendanceSchema,
  hrCreateAttendanceSchema,
} from "../middlewares/attendance.validator.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class AttendanceController {
  /**
   * Employee check-in
   * @route POST /api/attendance/check-in
   * @access Private (Employee, HR)
   */
  async checkIn(req, res, next) {
    try {
      const userId = req.userId;

      console.log('✅ checkIn controller - userId:', userId);

      const attendance = await attendanceService.checkIn(userId);

      console.log('✅ checkIn controller - created attendance:', { 
        id: attendance._id, 
        user: attendance.user,
        date: attendance.date,
        checkIn: attendance.checkIn,
        status: attendance.status 
      });

      res.status(200).json({
        success: true,
        message: "Checked in successfully",
        data: attendance,
      });
    } catch (error) {
      logger.error("Error in checkIn controller:", error);
      next(error);
    }
  }

  /**
   * Employee check-out
   * @route POST /api/attendance/check-out
   * @access Private (Employee, HR)
   */
  async checkOut(req, res, next) {
    try {
      const userId = req.userId;

      const attendance = await attendanceService.checkOut(userId);

      res.status(200).json({
        success: true,
        message: "Checked out successfully",
        data: attendance,
      });
    } catch (error) {
      logger.error("Error in checkOut controller:", error);
      next(error);
    }
  }

  /**
   * Get employee's own attendance records
   * @route GET /api/attendance/my
   * @access Private (Employee, HR)
   */
  async getMyAttendance(req, res, next) {
    try {
      const userId = req.userId;

      console.log('🎯 getMyAttendance controller - userId:', userId);

      // Validate query parameters
      const filters = attendanceQuerySchema.parse(req.query);

      console.log('🎯 getMyAttendance controller - filters:', filters);

      const result = await attendanceService.getMyAttendance(userId, filters);

      console.log('🎯 getMyAttendance controller - result:', { recordsCount: result.records.length, pagination: result.pagination });

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getMyAttendance:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getMyAttendance controller:", error);
      next(error);
    }
  }

  /**
   * Get all employee attendance records (HR only)
   * @route GET /api/attendance
   * @access Private (HR only)
   */
  async getAllAttendance(req, res, next) {
    try {
      // Validate query parameters
      const filters = attendanceQuerySchema.parse(req.query);

      const result = await attendanceService.getAllAttendance(filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getAllAttendance:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getAllAttendance controller:", error);
      next(error);
    }
  }

  /**
   * Get attendance records for a specific user (HR only)
   * @route GET /api/attendance/:userId
   * @access Private (HR only)
   */
  async getAttendanceByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      // Validate query parameters
      const filters = attendanceQuerySchema.parse(req.query);

      const result = await attendanceService.getAttendanceByUserId(userId, filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getAttendanceByUserId:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getAttendanceByUserId controller:", error);
      next(error);
    }
  }

  /**
   * Update attendance record (HR only)
   * @route PUT /api/attendance/:attendanceId
   * @access Private (HR only)
   */
  async updateAttendance(req, res, next) {
    try {
      const { attendanceId } = req.params;
      const hrUserId = req.userId;

      if (!attendanceId) {
        throw new APIError(400, "Attendance ID is required");
      }

      // Validate request body
      const validatedData = hrUpdateAttendanceSchema.parse(req.body);

      const attendance = await attendanceService.updateAttendance(
        attendanceId,
        validatedData,
        hrUserId
      );

      res.status(200).json({
        success: true,
        message: "Attendance record updated successfully",
        data: attendance,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in updateAttendance:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in updateAttendance controller:", error);
      next(error);
    }
  }

  /**
   * Create attendance record manually (HR only)
   * @route POST /api/attendance
   * @access Private (HR only)
   */
  async createAttendance(req, res, next) {
    try {
      const hrUserId = req.userId;

      // Validate request body
      const validatedData = hrCreateAttendanceSchema.parse(req.body);

      const attendance = await attendanceService.createAttendance(
        validatedData,
        hrUserId
      );

      res.status(201).json({
        success: true,
        message: "Attendance record created successfully",
        data: attendance,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in createAttendance:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in createAttendance controller:", error);
      next(error);
    }
  }

  /**
   * Delete attendance record (HR only)
   * @route DELETE /api/attendance/:attendanceId
   * @access Private (HR only)
   */
  async deleteAttendance(req, res, next) {
    try {
      const { attendanceId } = req.params;

      if (!attendanceId) {
        throw new APIError(400, "Attendance ID is required");
      }

      await attendanceService.deleteAttendance(attendanceId);

      res.status(200).json({
        success: true,
        message: "Attendance record deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deleteAttendance controller:", error);
      next(error);
    }
  }
}

export default new AttendanceController();
