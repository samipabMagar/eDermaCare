import userModel from "../models/userModel.js";
import doctorProfileModel from "../models/doctorProfileModel.js";
import connection from "../configs/db.js";

// Service for user-related operations
class UserService {
  async registerUser(userData) {
    const existingUser = await userModel.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const user = await userModel.create(userData);

    const userResponse = user.toJSON();
    delete userResponse.password;

    // Parse address if it's a string
    if (userResponse.address && typeof userResponse.address === "string") {
      try {
        userResponse.address = JSON.parse(userResponse.address);
      } catch (error) {
        console.error("Failed to parse address:", error);
      }
    }

    return userResponse;
  }

  async loginUser(email, password) {
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const isPassword = await user.comparePassword(password);
    if (!isPassword) {
      throw new Error("Invalid email or password");
    }

    // If the user is a doctor, check their approval status
    if (user.role === "doctor") {
      const doctorProfile = await doctorProfileModel.findOne({
        where: { user_id: user.user_id },
      });

      if (doctorProfile) {
        if (doctorProfile.approval_status === "pending") {
          throw new Error(
            "Your registration is currently under review. Please wait for admin approval before logging in.",
          );
        }
        if (doctorProfile.approval_status === "rejected") {
          const rejectionMessage = doctorProfile.rejection_reason
            ? `Your registration has been rejected. Reason: ${doctorProfile.rejection_reason}`
            : "Your registration has been rejected. Please contact support for more information.";
          throw new Error(rejectionMessage);
        }
      }
    }

    const userResponse = user.toJSON();
    delete userResponse.password;

    // Parse address if it's a string
    if (userResponse.address && typeof userResponse.address === "string") {
      try {
        userResponse.address = JSON.parse(userResponse.address);
      } catch (error) {
        console.error("Failed to parse address:", error);
      }
    }

    return userResponse;
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await userModel.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Convert Sequelize instance to plain object and remove password
    const userResponse = user.toJSON();

    if (userResponse.address && typeof userResponse.address === "string") {
      try {
        userResponse.address = JSON.parse(userResponse.address);
      } catch (error) {
        console.error("Failed to parse address:", error);
      }
    }

    return userResponse;
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    const user = await userModel.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update(updateData);

    const updatedUser = user.toJSON();
    delete updatedUser.password;

    if (updatedUser.address && typeof updatedUser.address === "string") {
      try {
        updatedUser.address = JSON.parse(updatedUser.address);
      } catch (error) {
        console.error("Failed to parse address:", error);
      }
    }
    return updatedUser;
  }

  // Change user password
  async changeUserPassword(userId, current_password, new_password) {
    const user = await userModel.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isPassword = await user.comparePassword(current_password);
    if (!isPassword) {
      throw new Error("Current password is incorrect");
    }

    const isSamePassword = await user.comparePassword(new_password);
    if (isSamePassword) {
      throw new Error(
        "New password must be different from the current password",
      );
    }
    // Update the password (the beforeUpdate hook will handle hashing)
    await user.update({ password: new_password });
  }

  // Update profile image
  async updateProfileImage(userId, imagePath) {
    const user = await userModel.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const oldImagePath = user.profile_image;
    await user.update({ profile_image: imagePath });

    return { oldImagePath };
  }

  // Admin: Get all users
  async getAllUsers(filters = {}) {
    const whereClause = {};

    if (filters.role) {
      if (!["admin", "doctor", "user"].includes(filters.role)) {
        throw new Error("Invalid role filter");
      }
      whereClause.role = filters.role;
    }

    const users = await userModel.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
    });

    return users.map((user) => {
      const userResponse = user.toJSON();

      if (userResponse.address && typeof userResponse.address === "string") {
        try {
          userResponse.address = JSON.parse(userResponse.address);
        } catch (error) {
          console.error("Failed to parse address:", error);
        }
      }

      return userResponse;
    });
  }

  // Admin: Delete user
  async deleteUserByAdmin(targetUserId, currentUserId, currentUserRole) {
    if (currentUserRole !== "admin") {
      throw new Error("Only admin can delete users");
    }

    const userId = Number(targetUserId);
    if (Number.isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user id");
    }

    const actorUserId = Number(currentUserId);

    if (userId === actorUserId) {
      throw new Error("Admin cannot delete their own account");
    }

    const user = await userModel.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "admin") {
      throw new Error("Admin accounts cannot be deleted");
    }

    const deletedProfileImage = user.profile_image;

    await connection.transaction(async (transaction) => {
      await user.destroy({ transaction });
    });

    return { deletedProfileImage };
  }
}

export default new UserService();
