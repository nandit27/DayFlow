import EmployeeProfile from "../models/employeeProfile.model.js";
import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";

class EmployeeProfileService {
  /**
   * Get or create employee profile
   * @param {String} userId - User ID
   * @returns {Object} Employee profile
   */
  async getOrCreateProfile(userId) {
    try {
      let profile = await EmployeeProfile.findOne({ user: userId })
        .populate("user", "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt")
        .populate("reportingManager", "name email employeeId");

      if (!profile) {
        // Auto-create profile if it doesn't exist
        profile = await EmployeeProfile.create({ user: userId });
        profile = await EmployeeProfile.findById(profile._id)
          .populate("user", "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt")
          .populate("reportingManager", "name email employeeId");
      }

      return profile;
    } catch (error) {
      logger.error("Error in getOrCreateProfile service:", error);
      throw error;
    }
  }

  /**
   * Get employee's own profile (without salary for employees)
   * @param {String} userId - User ID
   * @param {String} userRole - User role
   * @returns {Object} Employee profile
   */
  async getMyProfile(userId, userRole) {
    try {
      const profile = await this.getOrCreateProfile(userId);

      // Remove salary field for employees
      if (userRole === "Employee") {
        const profileObj = profile.toObject();
        delete profileObj.salary;
        return profileObj;
      }

      return profile;
    } catch (error) {
      logger.error("Error in getMyProfile service:", error);
      throw error;
    }
  }

  /**
   * Update employee's own profile (restricted fields)
   * @param {String} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated profile
   */
  async updateMyProfile(userId, updateData) {
    try {
      // Only allow employee to update specific fields
      const allowedFields = {
        address: updateData.address,
        emergencyContact: updateData.emergencyContact,
        documents: updateData.documents,
      };

      // Remove undefined values
      Object.keys(allowedFields).forEach(
        (key) => allowedFields[key] === undefined && delete allowedFields[key]
      );

      const profile = await EmployeeProfile.findOneAndUpdate(
        { user: userId },
        { $set: allowedFields },
        { new: true, runValidators: true }
      )
        .populate("user", "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt")
        .populate("reportingManager", "name email employeeId");

      if (!profile) {
        throw new APIError(404, "Profile not found");
      }

      // Remove salary field
      const profileObj = profile.toObject();
      delete profileObj.salary;
      return profileObj;
    } catch (error) {
      logger.error("Error in updateMyProfile service:", error);
      throw error;
    }
  }

  /**
   * Get all employee profiles (HR only)
   * @param {Object} filters - Query filters
   * @returns {Array} List of employee profiles
   */
  async getAllProfiles(filters = {}) {
    try {
      const query = {};

      if (filters.department) {
        query.department = filters.department;
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.employmentType) {
        query.employmentType = filters.employmentType;
      }

      const profiles = await EmployeeProfile.find(query)
        .populate("user", "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt")
        .populate("reportingManager", "name email employeeId")
        .sort({ createdAt: -1 });

      return profiles;
    } catch (error) {
      logger.error("Error in getAllProfiles service:", error);
      throw error;
    }
  }

  /**
   * Get employee profile by user ID (HR only)
   * @param {String} userId - User ID
   * @returns {Object} Employee profile
   */
  async getProfileByUserId(userId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      return profile;
    } catch (error) {
      logger.error("Error in getProfileByUserId service:", error);
      throw error;
    }
  }

  /**
   * Update employee profile by user ID (HR only)
   * @param {String} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated profile
   */
  async updateProfileByUserId(userId, updateData) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      // Verify reporting manager exists if provided
      if (updateData.reportingManager) {
        const manager = await User.findById(updateData.reportingManager);
        if (!manager) {
          throw new APIError(400, "Reporting manager not found");
        }
      }

      // Get or create profile
      let profile = await EmployeeProfile.findOne({ user: userId });
      
      if (!profile) {
        // Create new profile with update data
        profile = await EmployeeProfile.create({
          user: userId,
          ...updateData,
        });
      } else {
        // Update existing profile
        profile = await EmployeeProfile.findOneAndUpdate(
          { user: userId },
          { $set: updateData },
          { new: true, runValidators: true }
        );
      }

      // Populate and return
      profile = await EmployeeProfile.findById(profile._id)
        .populate("user", "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt")
        .populate("reportingManager", "name email employeeId");

      return profile;
    } catch (error) {
      logger.error("Error in updateProfileByUserId service:", error);
      throw error;
    }
  }

  /**
   * Delete employee profile (HR only)
   * @param {String} userId - User ID
   * @returns {Object} Deleted profile
   */
  async deleteProfile(userId) {
    try {
      const profile = await EmployeeProfile.findOneAndDelete({ user: userId });

      if (!profile) {
        throw new APIError(404, "Profile not found");
      }

      return profile;
    } catch (error) {
      logger.error("Error in deleteProfile service:", error);
      throw error;
    }
  }
}

export default new EmployeeProfileService();
