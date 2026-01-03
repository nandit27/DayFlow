import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/verifyToken.js";
import dashboardController from "../controllers/dashboard.controller.js";

const router = express.Router();

// Employee Dashboard - Accessible by both Employee and HR
router.get("/employee", verifyToken, dashboardController.getEmployeeDashboard);

// HR Dashboard - Accessible by HR only
router.get(
  "/hr",
  verifyToken,
  authorizeRoles("HR"),
  dashboardController.getHRDashboard
);

// Attendance Trends - HR only
router.get(
  "/attendance-trends",
  verifyToken,
  authorizeRoles("HR"),
  dashboardController.getAttendanceTrends
);

// Department Statistics - HR only
router.get(
  "/department-stats",
  verifyToken,
  authorizeRoles("HR"),
  dashboardController.getDepartmentStats
);

export default router;
