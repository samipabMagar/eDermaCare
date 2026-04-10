import doctorProfileService from "../services/doctorProfileService.js";

class DoctorProfileController {
  async registerDoctor(req, res) {
    try {
      const registrationData = req.body;
      const result =
        await doctorProfileService.registerDoctor(registrationData);

      res.status(201).json({
        success: true,
        message:
          "Doctor registration submitted successfully. Please wait for admin approval.",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to register doctor",
      });
    }
  }

  // Admin: Get pending doctor registrations
  async getPendingDoctorRegistrations(req, res) {
    try {
      const pendingDoctors = await doctorProfileService.getPendingDoctors();

      res.status(200).json({
        success: true,
        message: "Pending doctor registrations retrieved successfully",
        data: pendingDoctors,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message || "Failed to retrieve pending doctor registrations",
      });
    }
  }

  // Admin: Approve doctor registration
  async approveDoctorRegistration(req, res) {
    try {
      const { userId } = req.params;

      const result = await doctorProfileService.approveDoctor(parseInt(userId));

      res.status(200).json({
        success: true,
        message: "Doctor registration approved successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to approve doctor registration",
      });
    }
  }

  // Admin: Reject doctor registration
  async rejectDoctorRegistration(req, res) {
    try {
      const { userId } = req.params;
      const rejection_reason = req.body?.rejection_reason || "";

      const result = await doctorProfileService.rejectDoctor(
        parseInt(userId),
        rejection_reason,
      );

      res.status(200).json({
        success: true,
        message: "Doctor registration rejected successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reject doctor registration",
      });
    }
  }

  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const hasPagination =
        req.query.page !== undefined || req.query.limit !== undefined;

      const filters = {
        is_available: req.query.is_available === "true" ? true : undefined,
        specialization: req.query.specialization,
        approval_status: req.query.approval_status,
        search: req.query.search?.trim() || undefined,
        sort_by: req.query.sort_by,
      };

      const pagination = hasPagination
        ? {
            page: req.query.page,
            limit: req.query.limit,
          }
        : null;

      const doctors = await doctorProfileService.getAllDoctors(
        filters,
        pagination,
      );

      res.status(200).json({
        success: true,
        message: "Doctors retrieved successfully",
        data: doctors,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve doctors",
      });
    }
  }

  // Get doctor profile by user ID
  async getDoctorByUserId(req, res) {
    try {
      const { userId } = req.params;

      const doctor = await doctorProfileService.getDoctorProfileByUserId(
        parseInt(userId),
      );

      res.status(200).json({
        success: true,
        message: "Doctor profile retrieved successfully",
        data: doctor,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to retrieve doctor profile",
      });
    }
  }

  // Get logged-in doctor's profile
  async getMyProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile =
        await doctorProfileService.getDoctorProfileByUserId(userId);

      res.status(200).json({
        success: true,
        message: "Doctor profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to get doctor profile",
      });
    }
  }

  // Doctor updates their profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      const updatedProfile = await doctorProfileService.updateDoctorProfile(
        userId,
        profileData,
      );

      res.status(200).json({
        success: true,
        message: "Doctor profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update doctor profile",
      });
    }
  }

  // Doctor updates their availability status
  async updateAvailability(req, res) {
    try {
      const userId = req.user.id;
      const profile =
        await doctorProfileService.updateDoctorAvailability(userId);

      res.status(200).json({
        success: true,
        message: `Doctor availability updated to ${profile.is_available ? "available" : "unavailable"}. `,
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update doctor availability",
      });
    }
  }
}

export default new DoctorProfileController();
