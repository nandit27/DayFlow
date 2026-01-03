import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/verifyToken.js";
import employeeProfileController from "../controllers/employeeProfile.controller.js";

const router = express.Router();

// Employee Routes - Accessible by both Employee and HR
router.get("/me", verifyToken, employeeProfileController.getMyProfile);
router.put("/me", verifyToken, employeeProfileController.updateMyProfile);

// HR Routes - Accessible by HR only
router.post(
  "/create-employee",
  verifyToken,
  authorizeRoles("HR"),
  employeeProfileController.createEmployee
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("HR"),
  employeeProfileController.getAllProfiles
);

router.get(
  "/:userId",
  verifyToken,
  authorizeRoles("HR"),
  employeeProfileController.getProfileByUserId
);

router.put(
  "/:userId",
  verifyToken,
  authorizeRoles("HR"),
  employeeProfileController.updateProfileByUserId
);

router.delete(
  "/:userId",
  verifyToken,
  authorizeRoles("HR"),
  employeeProfileController.deleteProfile
);

export default router;
