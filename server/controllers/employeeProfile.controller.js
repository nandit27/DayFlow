import employeeProfileService from "../services/employeeProfile.service.js";
import {
  employeeUpdateSchema,
  hrUpdateSchema,
} from "../middlewares/employeeProfile.validator.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class EmployeeProfileController {
  /**
   * Get employee's own profile
   * @route GET /api/profile/me
   * @access Private (Employee, HR)
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      const profile = await employeeProfileService.getMyProfile(userId, userRole);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error("Error in getMyProfile controller:", error);
      next(error);
    }
  }

  /**
   * Update employee's own profile (restricted fields)
   * @route PUT /api/profile/me
   * @access Private (Employee, HR)
   */
  async updateMyProfile(req, res, next) {
    try {
      const userId = req.userId;

      // Validate request body
      const validatedData = employeeUpdateSchema.parse(req.body);

      const profile = await employeeProfileService.updateMyProfile(
        userId,
        validatedData
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in updateMyProfile:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in updateMyProfile controller:", error);
      next(error);
    }
  }

  /**
   * Get all employee profiles (HR only)
   * @route GET /api/profile
   * @access Private (HR only)
   */
  async getAllProfiles(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        employmentType: req.query.employmentType,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
      };

      const profiles = await employeeProfileService.getAllProfiles(filters);

      res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles,
      });
    } catch (error) {
      logger.error("Error in getAllProfiles controller:", error);
      next(error);
    }
  }

  /**
   * Get employee profile by user ID (HR only)
   * @route GET /api/profile/:userId
   * @access Private (HR only)
   */
  async getProfileByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      const profile = await employeeProfileService.getProfileByUserId(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error("Error in getProfileByUserId controller:", error);
      next(error);
    }
  }

  /**
   * Update employee profile by user ID (HR only)
   * @route PUT /api/profile/:userId
   * @access Private (HR only)
   */
  async updateProfileByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      // Validate request body
      const validatedData = hrUpdateSchema.parse(req.body);

      const profile = await employeeProfileService.updateProfileByUserId(
        userId,
        validatedData
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        logger.error("Validation error in updateProfileByUserId:", error);
        return next(new APIError(400, "Validation error", error.errors));
      }
      logger.error("Error in updateProfileByUserId controller:", error);
      next(error);
    }
  }

  /**
   * Delete employee profile (HR only)
   * @route DELETE /api/profile/:userId
   * @access Private (HR only)
   */
  async deleteProfile(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      await employeeProfileService.deleteProfile(userId);

      res.status(200).json({
        success: true,
        message: "Profile deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deleteProfile controller:", error);
      next(error);
    }
  }
}

export default new EmployeeProfileController();
