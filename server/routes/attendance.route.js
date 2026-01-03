import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/verifyToken.js";
import attendanceController from "../controllers/attendance.controller.js";

const router = express.Router();

// Employee Routes - Accessible by both Employee and HR
router.post("/check-in", verifyToken, attendanceController.checkIn);
router.post("/check-out", verifyToken, attendanceController.checkOut);
router.get("/my", verifyToken, attendanceController.getMyAttendance);

// HR Routes - Accessible by HR only
// Note: /all route MUST come before /:userId to avoid route conflicts
router.get(
  "/all",
  verifyToken,
  authorizeRoles("HR"),
  attendanceController.getAllAttendance
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("HR"),
  attendanceController.getAllAttendance
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("HR"),
  attendanceController.createAttendance
);

router.get(
  "/:userId",
  verifyToken,
  authorizeRoles("HR"),
  attendanceController.getAttendanceByUserId
);

router.put(
  "/:attendanceId",
  verifyToken,
  authorizeRoles("HR"),
  attendanceController.updateAttendance
);

router.delete(
  "/:attendanceId",
  verifyToken,
  authorizeRoles("HR"),
  attendanceController.deleteAttendance
);

export default router;
