import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/verifyToken.js";
import leaveController from "../controllers/leave.controller.js";

const router = express.Router();

// Employee Routes - Accessible by both Employee and HR
router.post("/", verifyToken, leaveController.applyLeave);
router.get("/my", verifyToken, leaveController.getMyLeaves);
router.delete("/:leaveId", verifyToken, leaveController.deleteLeaveRequest);

// HR Routes - Accessible by HR only
router.get(
  "/",
  verifyToken,
  authorizeRoles("HR"),
  leaveController.getAllLeaves
);

router.put(
  "/:leaveId/approve",
  verifyToken,
  authorizeRoles("HR"),
  leaveController.approveLeave
);

router.put(
  "/:leaveId/reject",
  verifyToken,
  authorizeRoles("HR"),
  leaveController.rejectLeave
);

export default router;
