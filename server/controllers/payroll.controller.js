import payrollService from "../services/payroll.service.js";
import {
  createPayrollSchema,
  updatePayrollSchema,
  payrollQuerySchema,
} from "../middlewares/payroll.validator.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class PayrollController {
  /**
   * Get employee's own payroll records
   * @route GET /api/payroll/my
   * @access Private (Employee, HR)
   */
  async getMyPayroll(req, res, next) {
    try {
      const userId = req.userId;

      // Validate query parameters
      const filters = payrollQuerySchema.parse(req.query);

      const result = await payrollService.getMyPayroll(userId, filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getMyPayroll:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getMyPayroll controller:", error);
      next(error);
    }
  }

  /**
   * Get all payroll records (HR only)
   * @route GET /api/payroll
   * @access Private (HR only)
   */
  async getAllPayroll(req, res, next) {
    try {
      // Validate query parameters
      const filters = payrollQuerySchema.parse(req.query);

      const result = await payrollService.getAllPayroll(filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getAllPayroll:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getAllPayroll controller:", error);
      next(error);
    }
  }

  /**
   * Get payroll records for a specific user (HR only)
   * @route GET /api/payroll/:userId
   * @access Private (HR only)
   */
  async getPayrollByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      // Validate query parameters
      const filters = payrollQuerySchema.parse(req.query);

      const result = await payrollService.getPayrollByUserId(userId, filters);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in getPayrollByUserId:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in getPayrollByUserId controller:", error);
      next(error);
    }
  }

  /**
   * Create payroll record (HR only)
   * @route POST /api/payroll
   * @access Private (HR only)
   */
  async createPayroll(req, res, next) {
    try {
      const hrUserId = req.userId;

      // Validate request body
      const validatedData = createPayrollSchema.parse(req.body);

      const payroll = await payrollService.createPayroll(validatedData, hrUserId);

      res.status(201).json({
        success: true,
        message: "Payroll record created successfully",
        data: payroll,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in createPayroll:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in createPayroll controller:", error);
      next(error);
    }
  }

  /**
   * Update payroll record (HR only)
   * @route PUT /api/payroll/:payrollId
   * @access Private (HR only)
   */
  async updatePayroll(req, res, next) {
    try {
      const { payrollId } = req.params;
      const hrUserId = req.userId;

      if (!payrollId) {
        throw new APIError(400, "Payroll ID is required");
      }

      // Validate request body
      const validatedData = updatePayrollSchema.parse(req.body);

      const payroll = await payrollService.updatePayroll(
        payrollId,
        validatedData,
        hrUserId
      );

      res.status(200).json({
        success: true,
        message: "Payroll record updated successfully",
        data: payroll,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in updatePayroll:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in updatePayroll controller:", error);
      next(error);
    }
  }

  /**
   * Delete payroll record (HR only)
   * @route DELETE /api/payroll/:payrollId
   * @access Private (HR only)
   */
  async deletePayroll(req, res, next) {
    try {
      const { payrollId } = req.params;

      if (!payrollId) {
        throw new APIError(400, "Payroll ID is required");
      }

      await payrollService.deletePayroll(payrollId);

      res.status(200).json({
        success: true,
        message: "Payroll record deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deletePayroll controller:", error);
      next(error);
    }
  }

  /**
   * Get payroll statistics (HR only)
   * @route GET /api/payroll/stats
   * @access Private (HR only)
   */
  async getPayrollStats(req, res, next) {
    try {
      const { month } = req.query;

      // Validate month format if provided
      if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw new APIError(400, "Month must be in YYYY-MM format");
      }

      const stats = await payrollService.getPayrollStats(month);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Error in getPayrollStats controller:", error);
      next(error);
    }
  }
}

export default new PayrollController();
