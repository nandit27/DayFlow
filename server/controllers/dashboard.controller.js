import dashboardService from "../services/dashboard.service.js";
import { dashboardQuerySchema } from "../middlewares/dashboard.validator.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class DashboardController {
  /**
   * Get Employee Dashboard
   * @route GET /api/dashboard/employee
   * @access Private (Employee, HR)
   */
  async getEmployeeDashboard(req, res, next) {
    try {
      const userId = req.userId;

      const dashboard = await dashboardService.getEmployeeDashboard(userId);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error in getEmployeeDashboard controller:", error);
      next(error);
    }
  }

  /**
   * Get HR Dashboard
   * @route GET /api/dashboard/hr
   * @access Private (HR only)
   */
  async getHRDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getHRDashboard();

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error in getHRDashboard controller:", error);
      next(error);
    }
  }

  /**
   * Get attendance trends (HR only)
   * @route GET /api/dashboard/attendance-trends
   * @access Private (HR only)
   */
  async getAttendanceTrends(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 7;

      if (days < 1 || days > 90) {
        throw new APIError(400, "Days must be between 1 and 90");
      }

      const trends = await dashboardService.getAttendanceTrends(days);

      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error("Error in getAttendanceTrends controller:", error);
      next(error);
    }
  }

  /**
   * Get department statistics (HR only)
   * @route GET /api/dashboard/department-stats
   * @access Private (HR only)
   */
  async getDepartmentStats(req, res, next) {
    try {
      const stats = await dashboardService.getDepartmentStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Error in getDepartmentStats controller:", error);
      next(error);
    }
  }
}

export default new DashboardController();
