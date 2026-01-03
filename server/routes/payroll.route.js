import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/verifyToken.js";
import payrollController from "../controllers/payroll.controller.js";

const router = express.Router();

// Employee Routes - Accessible by both Employee and HR
router.get("/my", verifyToken, payrollController.getMyPayroll);

// HR Routes - Accessible by HR only
router.get(
  "/stats",
  verifyToken,
  authorizeRoles("HR"),
  payrollController.getPayrollStats
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("HR"),
  payrollController.getAllPayroll
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("HR"),
  payrollController.createPayroll
);

router.get(
  "/:userId",
  verifyToken,
  authorizeRoles("HR"),
  payrollController.getPayrollByUserId
);

router.put(
  "/:payrollId",
  verifyToken,
  authorizeRoles("HR"),
  payrollController.updatePayroll
);

router.delete(
  "/:payrollId",
  verifyToken,
  authorizeRoles("HR"),
  payrollController.deletePayroll
);

export default router;
