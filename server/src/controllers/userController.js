import { generateToken } from "../helpers/jwtHelper.js";
import userService from "../services/userService.js";
import { deleteOldImage } from "../configs/multerConfig.js";

// Controller for user-related operations
class UserController {
  // Register a new user
  async register(req, res) {
    try {
      const userData = req.body;
      const newUser = await userService.registerUser(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to register user",
      });
    }
  }

  // Login user and generate JWT token
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userService.loginUser(email, password);

      const token = generateToken({
        id: user.user_id,
        role: user.role,
      });

      const isProduction = process.env.NODE_ENV === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      res.cookie("token", token, cookieOptions);

      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to login user",
      });
    }
  }

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get user profile",
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const isProduction = process.env.NODE_ENV === "production";

      res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });

      res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to logout user",
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const updateUser = await userService.updateUserProfile(
        userId,
        updateData,
      );

      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: updateUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update user profile",
      });
    }
  }

  // Change user password
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;
      await userService.changeUserPassword(
        userId,
        current_password,
        new_password,
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to change password",
      });
    }
  }

  // Upload profile image
  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image file",
        });
      }

      const imagePath = `uploads/profiles/${req.file.filename}`;
      const { oldImagePath } = await userService.updateProfileImage(
        req.user.id,
        imagePath,
      );

      if (oldImagePath) deleteOldImage(oldImagePath);

      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload profile image",
      });
    }
  }

  // Admin: Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers(req.query);

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve users",
      });
    }
  }

  // Admin: Delete user
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await userService.deleteUserByAdmin(
        userId,
        req.user.id,
        req.user.role,
      );

      if (result.deletedProfileImage) {
        deleteOldImage(result.deletedProfileImage);
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }
}

export default new UserController();
