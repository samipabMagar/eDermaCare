import connection from "../configs/db.js";
import { Op } from "sequelize";
import userModel from "../models/userModel.js";
import doctorProfileModel from "../models/doctorProfileModel.js";
import {
  sendDoctorApprovalEmail,
  sendDoctorRejectionEmail,
} from "../utils/emailService.js";

class DoctorProfileService {
  // Register as doctor (Public)
  async registerDoctor(registrationData) {
    const transaction = await connection.transaction();
    try {
      const {
        full_name,
        email,
        phone,
        password,
        gender,
        address,
        specialization,
        license_number,
        years_of_experience,
        consultation_fee,
        bio,
        education,
        certifications,
      } = registrationData;

      const existingUser = await userModel.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const licenseExists = await doctorProfileModel.findOne({
        where: { license_number },
      });

      if (licenseExists) {
        throw new Error("License number already exists");
      }

      // Create user with role="doctor"
      const user = await userModel.create(
        {
          full_name,
          email,
          phone,
          password,
          gender,
          address,
          role: "doctor",
        },
        { transaction },
      );
      // Create doctor profile with pending approval
      const doctorProfile = await doctorProfileModel.create(
        {
          user_id: user.user_id,
          specialization,
          license_number,
          years_of_experience,
          consultation_fee,
          bio,
          education,
          certifications,
          approval_status: "pending",
        },
        { transaction },
      );

      await transaction.commit();

      const userResponse = user.toJSON();
      delete userResponse.password;

      return {
        user: userResponse,
        profile: doctorProfile.toJSON(),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  // Get pending doctor approvals (Admin only)
  async getPendingDoctors() {
    const profiles = await doctorProfileModel.findAll({
      where: { approval_status: "pending" },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: [
            "user_id",
            "full_name",
            "email",
            "phone",
            "gender",
            "address",
            "profile_image",
            "created_at",
          ],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return profiles.map((profile) => profile.toJSON());
  }

  // Approve doctor registration (Admin only)
  async approveDoctor(userId) {
    const profile = await doctorProfileModel.findOne({
      where: { user_id: userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["user_id", "full_name", "email", "phone"],
        },
      ],
    });

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    if (profile.approval_status == "approved") {
      throw new Error("Doctor is already approved");
    }

    await profile.update({
      approval_status: "approved",
      approved_at: new Date(),
      rejection_reason: null,
    });

    // send approval email to doctor
    try {
      await sendDoctorApprovalEmail(profile.user.email, profile.user.full_name);
    } catch (error) {
      console.error("Failed to send approval email:", error);
    }

    return profile.toJSON();
  }

  // Reject doctor registration (Admin only)
  async rejectDoctor(userId, reason) {
    const profile = await doctorProfileModel.findOne({
      where: { user_id: userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["user_id", "full_name", "email", "phone"],
        },
      ],
    });

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    if (profile.approval_status == "rejected") {
      throw new Error("Doctor is already rejected");
    }

    await profile.update({
      approval_status: "rejected",
      rejection_reason: reason || "No reason provided",
      approved_at: new Date(),
    });

    try {
      await sendDoctorRejectionEmail(
        profile.user.email,
        profile.user.full_name,
        reason,
      );
    } catch (error) {
      console.error("Failed to send rejection email:", error);
    }

    return profile.toJSON();
  }

  // Get all doctor profiles (optionally paginated)
  async getAllDoctors(filters = {}, pagination = null) {
    const whereClause = {};
    const userWhereClause = {};

    if (filters.specialization) {
      whereClause.specialization = filters.specialization;
    }

    if (filters.is_available !== undefined) {
      whereClause.is_available = filters.is_available;
    }

    if (filters.approval_status) {
      whereClause.approval_status = filters.approval_status;
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      whereClause[Op.or] = [
        { specialization: { [Op.like]: searchPattern } },
        { bio: { [Op.like]: searchPattern } },
      ];

      userWhereClause[Op.or] = [
        { full_name: { [Op.like]: searchPattern } },
        { email: { [Op.like]: searchPattern } },
      ];
    }

    const orderClause = (() => {
      switch (filters.sort_by) {
        case "experience":
          return [["years_of_experience", "DESC"]];
        case "reviews":
          return [["total_reviews", "DESC"]];
        case "rating":
        default:
          return [["rating", "DESC"]];
      }
    })();

    const includeClause = [
      {
        model: userModel,
        as: "user",
        attributes: ["user_id", "full_name", "email", "phone", "profile_image"],
        ...(Object.keys(userWhereClause).length
          ? { where: userWhereClause, required: true }
          : {}),
      },
    ];

    if (pagination?.page && pagination?.limit) {
      const page = Math.max(1, Number(pagination.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(pagination.limit) || 6));
      const offset = (page - 1) * limit;

      const { rows, count } = await doctorProfileModel.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: orderClause,
        limit,
        offset,
        distinct: true,
      });

      const total = Number(count || 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        doctors: rows.map((profile) => profile.toJSON()),
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_previous_page: page > 1,
        },
      };
    }

    const profiles = await doctorProfileModel.findAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
    });

    return profiles.map((profile) => profile.toJSON());
  }

  // Get doctor profile by user ID
  async getDoctorProfileByUserId(userId) {
    const profile = await doctorProfileModel.findOne({
      where: { user_id: userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: [
            "user_id",
            "full_name",
            "email",
            "phone",
            "profile_image",
          ],
        },
      ],
    });

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    return profile.toJSON();
  }

  // Get doctor profile by user ID
  async getDoctorProfileByUserId(userId) {
    const profile = await doctorProfileModel.findOne({
      where: { user_id: userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: [
            "user_id",
            "full_name",
            "email",
            "phone",
            "profile_image",
          ],
        },
      ],
    });

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    return profile.toJSON();
  }

  // Update doctor profile
  async updateDoctorProfile(userId, updateData) {
    const profile = await doctorProfileModel.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    if (
      updateData.license_number &&
      updateData.license_number !== profile.license_number
    ) {
      const licenseExists = await doctorProfileModel.findOne({
        where: { license_number: updateData.license_number },
      });
      if (licenseExists) {
        throw new Error("License number already exists");
      }
    }

    await profile.update(updateData);

    return profile.toJSON();
  }

  // Toggle doctor availability
  async updateDoctorAvailability(userId) {
    const profile = await doctorProfileModel.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    await profile.update({ is_available: !profile.is_available });

    return profile.toJSON();
  }
}

export default new DoctorProfileService();
