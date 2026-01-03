import Payroll from "../models/payroll.model.js";
import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class PayrollService {
  /**
   * Calculate gross salary
   * @param {Object} salary - Salary breakdown
   * @returns {Number} Gross salary
   */
  calculateGrossSalary(salary) {
    const { basic = 0, hra = 0, allowances = 0 } = salary;
    return basic + hra + allowances;
  }

  /**
   * Calculate net salary
   * @param {Number} grossSalary - Gross salary
   * @param {Number} deductions - Deductions
   * @returns {Number} Net salary
   */
  calculateNetSalary(grossSalary, deductions = 0) {
    return Math.max(grossSalary - deductions, 0);
  }

  /**
   * Validate month format and extract year
   * @param {String} month - Month in YYYY-MM format
   * @returns {Number} Year
   */
  extractYearFromMonth(month) {
    const [year] = month.split("-");
    return parseInt(year, 10);
  }

  /**
   * Create payroll record (HR only)
   * @param {Object} payrollData - Payroll data
   * @param {String} hrUserId - HR user ID
   * @returns {Object} Created payroll record
   */
  async createPayroll(payrollData, hrUserId) {
    try {
      const { userId, month, year, salary, remarks } = payrollData;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      // Check for duplicate payroll
      const existingPayroll = await Payroll.findOne({
        user: userId,
        month,
      });

      if (existingPayroll) {
        throw new APIError(
          409,
          `Payroll already exists for ${month}. Use update instead.`
        );
      }

      // Validate year matches month
      const extractedYear = this.extractYearFromMonth(month);
      if (extractedYear !== year) {
        throw new APIError(400, "Year must match the year in month (YYYY-MM)");
      }

      // Calculate gross and net salary
      const grossSalary = this.calculateGrossSalary(salary);
      const netSalary = this.calculateNetSalary(grossSalary, salary.deductions || 0);

      // Create payroll record
      const payroll = await Payroll.create({
        user: userId,
        month,
        year,
        salary: {
          basic: salary.basic,
          hra: salary.hra || 0,
          allowances: salary.allowances || 0,
          deductions: salary.deductions || 0,
        },
        grossSalary,
        netSalary,
        generatedBy: hrUserId,
        generatedAt: new Date(),
        remarks,
      });

      await payroll.populate([
        { path: "user", select: "name email employeeId" },
        { path: "generatedBy", select: "name email" },
      ]);

      return payroll;
    } catch (error) {
      logger.error("Error in createPayroll service:", error);
      throw error;
    }
  }

  /**
   * Get employee's own payroll records
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Object} Payroll records with pagination
   */
  async getMyPayroll(userId, filters = {}) {
    try {
      const { month, year, page = 1, limit = 20 } = filters;

      const query = { user: userId };

      // Month filter
      if (month) {
        query.month = month;
      }

      // Year filter
      if (year) {
        query.year = year;
      }

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        Payroll.find(query)
          .populate("user", "name email employeeId")
          .populate("generatedBy", "name email")
          .sort({ year: -1, month: -1 })
          .skip(skip)
          .limit(limit),
        Payroll.countDocuments(query),
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
      logger.error("Error in getMyPayroll service:", error);
      throw error;
    }
  }

  /**
   * Get all payroll records (HR only)
   * @param {Object} filters - Query filters
   * @returns {Object} Payroll records with pagination
   */
  async getAllPayroll(filters = {}) {
    try {
      const { month, year, page = 1, limit = 20 } = filters;

      const query = {};

      // Month filter
      if (month) {
        query.month = month;
      }

      // Year filter
      if (year) {
        query.year = year;
      }

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        Payroll.find(query)
          .populate("user", "name email employeeId")
          .populate("generatedBy", "name email")
          .sort({ year: -1, month: -1 })
          .skip(skip)
          .limit(limit),
        Payroll.countDocuments(query),
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
      logger.error("Error in getAllPayroll service:", error);
      throw error;
    }
  }

  /**
   * Get payroll records for a specific user (HR only)
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Object} Payroll records with pagination
   */
  async getPayrollByUserId(userId, filters = {}) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      return await this.getMyPayroll(userId, filters);
    } catch (error) {
      logger.error("Error in getPayrollByUserId service:", error);
      throw error;
    }
  }

  /**
   * Update payroll record (HR only)
   * @param {String} payrollId - Payroll ID
   * @param {Object} updateData - Update data
   * @param {String} hrUserId - HR user ID
   * @returns {Object} Updated payroll record
   */
  async updatePayroll(payrollId, updateData, hrUserId) {
    try {
      const payroll = await Payroll.findById(payrollId);

      if (!payroll) {
        throw new APIError(404, "Payroll record not found");
      }

      // Update salary breakdown if provided
      if (updateData.salary) {
        payroll.salary = {
          basic: updateData.salary.basic ?? payroll.salary.basic,
          hra: updateData.salary.hra ?? payroll.salary.hra,
          allowances: updateData.salary.allowances ?? payroll.salary.allowances,
          deductions: updateData.salary.deductions ?? payroll.salary.deductions,
        };

        // Recalculate gross and net salary
        payroll.grossSalary = this.calculateGrossSalary(payroll.salary);
        payroll.netSalary = this.calculateNetSalary(
          payroll.grossSalary,
          payroll.salary.deductions
        );
      }

      // Update remarks if provided
      if (updateData.remarks !== undefined) {
        payroll.remarks = updateData.remarks;
      }

      // Update metadata
      payroll.generatedBy = hrUserId;
      payroll.generatedAt = new Date();

      await payroll.save();

      await payroll.populate([
        { path: "user", select: "name email employeeId" },
        { path: "generatedBy", select: "name email" },
      ]);

      return payroll;
    } catch (error) {
      logger.error("Error in updatePayroll service:", error);
      throw error;
    }
  }

  /**
   * Delete payroll record (HR only)
   * @param {String} payrollId - Payroll ID
   * @returns {Object} Deleted payroll record
   */
  async deletePayroll(payrollId) {
    try {
      const payroll = await Payroll.findByIdAndDelete(payrollId);

      if (!payroll) {
        throw new APIError(404, "Payroll record not found");
      }

      return payroll;
    } catch (error) {
      logger.error("Error in deletePayroll service:", error);
      throw error;
    }
  }

  /**
   * Get payroll statistics (HR only)
   * @param {String} month - Month in YYYY-MM format
   * @returns {Object} Statistics
   */
  async getPayrollStats(month) {
    try {
      const query = month ? { month } : {};

      const stats = await Payroll.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            totalGrossSalary: { $sum: "$grossSalary" },
            totalNetSalary: { $sum: "$netSalary" },
            totalDeductions: { $sum: "$salary.deductions" },
            avgGrossSalary: { $avg: "$grossSalary" },
            avgNetSalary: { $avg: "$netSalary" },
          },
        },
      ]);

      return stats[0] || {
        totalEmployees: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalDeductions: 0,
        avgGrossSalary: 0,
        avgNetSalary: 0,
      };
    } catch (error) {
      logger.error("Error in getPayrollStats service:", error);
      throw error;
    }
  }
}

export default new PayrollService();
