import EmployeeProfile from "../models/employeeProfile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
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

  /**
   * Generate Employee ID
   * Format: CompanyInitials + FirstTwoLettersFirstName + FirstTwoLettersLastName + Year + SerialNumber
   * Example: OIJODO20220001
   * @param {String} companyName - Company name
   * @param {String} employeeName - Employee full name
   * @param {Number} joiningYear - Year of joining
   * @returns {String} Generated employee ID
   */
  async generateEmployeeId(companyName, employeeName, joiningYear) {
    try {
      // Extract company initials (first two letters of each word)
      const companyWords = companyName.trim().split(/\s+/);
      let companyInitials = '';
      
      if (companyWords.length === 1) {
        // Single word company - take first 2 letters
        companyInitials = companyWords[0].substring(0, 2).toUpperCase();
      } else {
        // Multiple words - take first letter of each word, max 2
        companyInitials = companyWords
          .slice(0, 2)
          .map(word => word.charAt(0).toUpperCase())
          .join('');
      }

      // Extract employee name parts
      const nameParts = employeeName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts[nameParts.length - 1] || '';
      
      const firstNameInitials = firstName.substring(0, 2).toUpperCase();
      const lastNameInitials = lastName.substring(0, 2).toUpperCase();

      // Get year (last 4 digits)
      const year = String(joiningYear);

      // Find the next serial number for this year
      const prefix = `${companyInitials}${firstNameInitials}${lastNameInitials}${year}`;
      const existingEmployees = await User.find({
        employeeId: new RegExp(`^${prefix}`)
      }).sort({ employeeId: -1 }).limit(1);

      let serialNumber = 1;
      if (existingEmployees.length > 0) {
        const lastEmployeeId = existingEmployees[0].employeeId;
        const lastSerial = parseInt(lastEmployeeId.slice(-4));
        serialNumber = lastSerial + 1;
      }

      const employeeId = `${prefix}${String(serialNumber).padStart(4, '0')}`;
      return employeeId;
    } catch (error) {
      logger.error("Error in generateEmployeeId:", error);
      throw error;
    }
  }

  /**
   * Generate random password
   * @returns {String} Generated password
   */
  generateRandomPassword() {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Create new employee (HR only)
   * @param {Object} employeeData - Employee data
   * @returns {Object} Created user and profile with generated password
   */
  async createEmployee(employeeData) {
    try {
      const {
        companyName,
        name,
        email,
        phone,
        role = 'Employee',
        joiningDate,
        department,
        designation,
        ...profileData
      } = employeeData;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new APIError(400, "Email already exists");
      }

      // Get joining year from joiningDate or current year
      const joiningYear = joiningDate ? new Date(joiningDate).getFullYear() : new Date().getFullYear();

      // Generate employee ID
      const employeeId = await this.generateEmployeeId(companyName, name, joiningYear);

      // Generate random password
      const generatedPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // Create user (password is already hashed)
      const user = new User({
        employeeId,
        companyName,
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isVerified: true, // Auto-verify HR-created accounts
      });

      // Mark password as not modified to prevent double-hashing in pre-save hook
      user.markModified('password');
      // Set a flag to skip the hashing in pre-save hook
      user.$locals = { skipPasswordHash: true };
      
      await user.save();

      // Create employee profile
      const profile = await EmployeeProfile.create({
        user: user._id,
        department,
        designation,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        ...profileData,
      });

      await profile.populate("user", "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt");

      return {
        user: {
          ...user.toObject(),
          password: undefined,
        },
        profile,
        generatedPassword, // Return this only once for HR to share with employee
        employeeId,
      };
    } catch (error) {
      logger.error("Error in createEmployee service:", error);
      throw error;
    }
  }
}

export default new EmployeeProfileService();
