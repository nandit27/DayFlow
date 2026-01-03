import User from "../models/user.model.js";
import EmployeeProfile from "../models/employeeProfile.model.js";
import Attendance from "../models/attendance.model.js";
import LeaveRequest from "../models/leaveRequest.model.js";
import Payroll from "../models/payroll.model.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class DashboardService {
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
   * Get start and end of current month
   * @returns {Object} Start and end dates
   */
  getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
  }

  /**
   * Get current month in YYYY-MM format
   * @returns {String} Current month
   */
  getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  /**
   * Get Employee Dashboard
   * @param {String} userId - User ID
   * @returns {Object} Employee dashboard data
   */
  async getEmployeeDashboard(userId) {
    try {
      const today = this.normalizeDate(new Date());
      const { startOfMonth, endOfMonth } = this.getCurrentMonthRange();
      const currentMonth = this.getCurrentMonth();

      // Parallel queries for better performance
      const [
        todayAttendance,
        monthlyAttendanceStats,
        leaveStats,
        latestPayroll,
        userProfile,
      ] = await Promise.all([
        // Today's attendance status
        Attendance.findOne({ user: userId, date: today }).select(
          "status checkIn checkOut"
        ),

        // Monthly attendance summary
        Attendance.aggregate([
          {
            $match: {
              user: userId,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Leave summary
        LeaveRequest.aggregate([
          {
            $match: { user: userId },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalDays: { $sum: "$totalDays" },
            },
          },
        ]),

        // Latest payroll (most recent month)
        Payroll.findOne({ user: userId })
          .sort({ year: -1, month: -1 })
          .select("month year grossSalary netSalary"),

        // User profile for basic info
        User.findById(userId).select("name email employeeId role"),
      ]);

      // Format attendance stats
      const attendanceByStatus = {
        PRESENT: 0,
        ABSENT: 0,
        HALF_DAY: 0,
        LEAVE: 0,
      };

      monthlyAttendanceStats.forEach((stat) => {
        attendanceByStatus[stat._id] = stat.count;
      });

      const totalWorkingDays =
        attendanceByStatus.PRESENT +
        attendanceByStatus.ABSENT +
        attendanceByStatus.HALF_DAY +
        attendanceByStatus.LEAVE;

      // Format leave stats
      const leaveByStatus = {
        PENDING: { count: 0, days: 0 },
        APPROVED: { count: 0, days: 0 },
        REJECTED: { count: 0, days: 0 },
      };

      leaveStats.forEach((stat) => {
        leaveByStatus[stat._id] = {
          count: stat.count,
          days: stat.totalDays,
        };
      });

      return {
        user: userProfile,
        todayAttendance: todayAttendance
          ? {
              status: todayAttendance.status,
              checkIn: todayAttendance.checkIn,
              checkOut: todayAttendance.checkOut,
            }
          : null,
        monthlyAttendance: {
          month: currentMonth,
          totalWorkingDays,
          present: attendanceByStatus.PRESENT,
          absent: attendanceByStatus.ABSENT,
          halfDay: attendanceByStatus.HALF_DAY,
          leave: attendanceByStatus.LEAVE,
          attendancePercentage:
            totalWorkingDays > 0
              ? ((attendanceByStatus.PRESENT + attendanceByStatus.HALF_DAY * 0.5) /
                  totalWorkingDays) *
                100
              : 0,
        },
        leaveSummary: {
          pending: leaveByStatus.PENDING,
          approved: leaveByStatus.APPROVED,
          rejected: leaveByStatus.REJECTED,
          totalLeavesTaken: leaveByStatus.APPROVED.days,
        },
        latestPayroll: latestPayroll
          ? {
              month: latestPayroll.month,
              year: latestPayroll.year,
              grossSalary: latestPayroll.grossSalary,
              netSalary: latestPayroll.netSalary,
            }
          : null,
      };
    } catch (error) {
      logger.error("Error in getEmployeeDashboard service:", error);
      throw error;
    }
  }

  /**
   * Get HR Dashboard
   * @returns {Object} HR dashboard data
   */
  async getHRDashboard() {
    try {
      const today = this.normalizeDate(new Date());
      const currentMonth = this.getCurrentMonth();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Parallel queries for better performance
      const [
        employeeStats,
        todayAttendanceStats,
        pendingLeaveCount,
        payrollStats,
        recentJoins,
      ] = await Promise.all([
        // Total employees (active vs inactive)
        EmployeeProfile.aggregate([
          {
            $group: {
              _id: "$isActive",
              count: { $sum: 1 },
            },
          },
        ]),

        // Today's attendance summary
        Attendance.aggregate([
          {
            $match: { date: today },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Pending leave requests count
        LeaveRequest.countDocuments({ status: "PENDING" }),

        // Payroll stats for current month
        Payroll.aggregate([
          {
            $match: { month: currentMonth },
          },
          {
            $group: {
              _id: null,
              generated: { $sum: 1 },
              totalGrossSalary: { $sum: "$grossSalary" },
              totalNetSalary: { $sum: "$netSalary" },
            },
          },
        ]),

        // Recently joined employees (last 30 days)
        EmployeeProfile.find({
          joiningDate: { $gte: thirtyDaysAgo },
        })
          .populate("user", "name email employeeId")
          .select("joiningDate department designation")
          .sort({ joiningDate: -1 })
          .limit(10),
      ]);

      // Get total active employees for payroll pending calculation
      const totalActiveEmployees = await EmployeeProfile.countDocuments({
        isActive: true,
      });

      // Format employee stats
      let activeEmployees = 0;
      let inactiveEmployees = 0;

      employeeStats.forEach((stat) => {
        if (stat._id === true) {
          activeEmployees = stat.count;
        } else {
          inactiveEmployees = stat.count;
        }
      });

      // Format today's attendance
      const todayAttendance = {
        PRESENT: 0,
        ABSENT: 0,
        HALF_DAY: 0,
        LEAVE: 0,
      };

      todayAttendanceStats.forEach((stat) => {
        todayAttendance[stat._id] = stat.count;
      });

      const totalCheckedIn =
        todayAttendance.PRESENT + todayAttendance.HALF_DAY + todayAttendance.LEAVE;

      // Format payroll stats
      const payrollGenerated = payrollStats[0]?.generated || 0;
      const payrollPending = Math.max(totalActiveEmployees - payrollGenerated, 0);

      return {
        overview: {
          totalEmployees: activeEmployees + inactiveEmployees,
          activeEmployees,
          inactiveEmployees,
        },
        todayAttendance: {
          date: today,
          present: todayAttendance.PRESENT,
          absent: todayAttendance.ABSENT,
          halfDay: todayAttendance.HALF_DAY,
          leave: todayAttendance.LEAVE,
          totalCheckedIn,
          totalEmployees: activeEmployees,
          attendanceRate:
            activeEmployees > 0 ? (totalCheckedIn / activeEmployees) * 100 : 0,
        },
        leaves: {
          pendingApprovals: pendingLeaveCount,
        },
        payroll: {
          month: currentMonth,
          generated: payrollGenerated,
          pending: payrollPending,
          totalGrossSalary: payrollStats[0]?.totalGrossSalary || 0,
          totalNetSalary: payrollStats[0]?.totalNetSalary || 0,
        },
        recentJoins: recentJoins.map((profile) => ({
          userId: profile.user?._id,
          name: profile.user?.name,
          email: profile.user?.email,
          employeeId: profile.user?.employeeId,
          department: profile.department,
          designation: profile.designation,
          joiningDate: profile.joiningDate,
        })),
      };
    } catch (error) {
      logger.error("Error in getHRDashboard service:", error);
      throw error;
    }
  }

  /**
   * Get attendance trends (HR only)
   * @param {Number} days - Number of days to fetch (default 7)
   * @returns {Array} Daily attendance trends
   */
  async getAttendanceTrends(days = 7) {
    try {
      const endDate = this.normalizeDate(new Date());
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - (days - 1));

      const trends = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: "$date",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            statuses: {
              $push: {
                status: "$_id.status",
                count: "$count",
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return trends.map((trend) => {
        const statusObj = {
          PRESENT: 0,
          ABSENT: 0,
          HALF_DAY: 0,
          LEAVE: 0,
        };

        trend.statuses.forEach((s) => {
          statusObj[s.status] = s.count;
        });

        return {
          date: trend._id,
          present: statusObj.PRESENT,
          absent: statusObj.ABSENT,
          halfDay: statusObj.HALF_DAY,
          leave: statusObj.LEAVE,
          total:
            statusObj.PRESENT +
            statusObj.ABSENT +
            statusObj.HALF_DAY +
            statusObj.LEAVE,
        };
      });
    } catch (error) {
      logger.error("Error in getAttendanceTrends service:", error);
      throw error;
    }
  }

  /**
   * Get department-wise employee distribution (HR only)
   * @returns {Array} Department statistics
   */
  async getDepartmentStats() {
    try {
      const stats = await EmployeeProfile.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return stats.map((stat) => ({
        department: stat._id || "Unassigned",
        employeeCount: stat.count,
      }));
    } catch (error) {
      logger.error("Error in getDepartmentStats service:", error);
      throw error;
    }
  }
}

export default new DashboardService();
