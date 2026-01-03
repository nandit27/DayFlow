import leaveService from "../services/leave.service.js";
import {
  applyLeaveSchema,
  approveLeaveSchema,
  rejectLeaveSchema,
  leaveQuerySchema,
} from "../middlewares/leave.validator.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class LeaveController {
  /**
   * Apply for leave
   * @route POST /api/leaves
   * @access Private (Employee, HR)
   */
  async applyLeave(req, res, next) {
    try {
      const userId = req.userId;

      // Validate request body
      const validatedData = applyLeaveSchema.parse(req.body);

      const leaveRequest = await leaveService.applyLeave(userId, validatedData);

      res.status(201).json({
        success: true,
        message: "Leave request submitted successfully",
        data: leaveRequest,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in applyLeave:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in applyLeave controller:", error);
      next(error);
    }
  }

  /**
   * Get employee's own leave requests
   * @route GET /api/leaves/my
   * @access Private (Employee, HR)
   */
  async getMyLeaves(req, res, next) {
    try {
      const userId = req.userId;

      // Validate query parameters
      const filters = leaveQuerySchema.parse(req.query);

      const result = await leaveService.getMyLeaves(userId, filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getMyLeaves:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getMyLeaves controller:", error);
      next(error);
    }
  }

  /**
   * Get all leave requests (HR only)
   * @route GET /api/leaves
   * @access Private (HR only)
   */
  async getAllLeaves(req, res, next) {
    try {
      // Validate query parameters
      const filters = leaveQuerySchema.parse(req.query);

      const result = await leaveService.getAllLeaves(filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getAllLeaves:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getAllLeaves controller:", error);
      next(error);
    }
  }

  /**
   * Approve leave request (HR only)
   * @route PUT /api/leaves/:leaveId/approve
   * @access Private (HR only)
   */
  async approveLeave(req, res, next) {
    try {
      const { leaveId } = req.params;
      const hrUserId = req.userId;

      if (!leaveId) {
        throw new APIError(400, "Leave ID is required");
      }

      // Validate request body
      const validatedData = approveLeaveSchema.parse(req.body);

      const leaveRequest = await leaveService.approveLeave(
        leaveId,
        hrUserId,
        validatedData.reviewerComment
      );

      res.status(200).json({
        success: true,
        message: "Leave request approved successfully",
        data: leaveRequest,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in approveLeave:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in approveLeave controller:", error);
      next(error);
    }
  }

  /**
   * Reject leave request (HR only)
   * @route PUT /api/leaves/:leaveId/reject
   * @access Private (HR only)
   */
  async rejectLeave(req, res, next) {
    try {
      const { leaveId } = req.params;
      const hrUserId = req.userId;

      if (!leaveId) {
        throw new APIError(400, "Leave ID is required");
      }

      // Validate request body
      const validatedData = rejectLeaveSchema.parse(req.body);

      const leaveRequest = await leaveService.rejectLeave(
        leaveId,
        hrUserId,
        validatedData.reviewerComment
      );

      res.status(200).json({
        success: true,
        message: "Leave request rejected",
        data: leaveRequest,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in rejectLeave:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in rejectLeave controller:", error);
      next(error);
    }
  }

  /**
   * Delete leave request (Employee - only pending)
   * @route DELETE /api/leaves/:leaveId
   * @access Private (Employee, HR)
   */
  async deleteLeaveRequest(req, res, next) {
    try {
      const { leaveId } = req.params;
      const userId = req.userId;

      if (!leaveId) {
        throw new APIError(400, "Leave ID is required");
      }

      await leaveService.deleteLeaveRequest(leaveId, userId);

      res.status(200).json({
        success: true,
        message: "Leave request deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deleteLeaveRequest controller:", error);
      next(error);
    }
  }
}

export default new LeaveController();
