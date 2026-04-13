import treatmentService from "../services/treatmentService.js";

class TreatmentController {
  async listTreatmentsForAdmin(req, res) {
    try {
      const { treatments } = await treatmentService.listTreatments({
        includeInactive: true,
      });

      return res.status(200).json({
        success: true,
        message:
          treatments.length > 0
            ? "Treatments retrieved successfully"
            : "No treatments found",
        data: treatments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve treatments",
      });
    }
  }

  async listTreatments(req, res) {
    try {
      const includeInactive = req.user?.role === "admin";
      const { treatments, pagination } = await treatmentService.listTreatments({
        includeInactive,
        search: req.query.search,
        category: req.query.category,
        sort: req.query.sort,
        page: req.query.page || 1,
        limit: req.query.limit || 9,
      });

      return res.status(200).json({
        success: true,
        message:
          treatments.length > 0
            ? "Treatments retrieved successfully"
            : "No treatments found",
        data: treatments,
        pagination,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve treatments",
      });
    }
  }

  async createTreatment(req, res) {
    try {
      const treatmentData = { ...req.body };

      if (req.file) {
        treatmentData.image_url = `uploads/treatments/${req.file.filename}`;
      }

      const treatment = await treatmentService.createTreatment(treatmentData);

      return res.status(201).json({
        success: true,
        message: "Treatment created successfully",
        data: treatment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create treatment",
      });
    }
  }

  async updateTreatment(req, res) {
    try {
      const treatmentId = req.params.treatmentId;
      const treatmentData = { ...req.body };

      if (req.file) {
        treatmentData.image_url = `uploads/treatments/${req.file.filename}`;
      }

      const treatment = await treatmentService.updateTreatment(
        treatmentId,
        treatmentData,
      );

      return res.status(200).json({
        success: true,
        message: "Treatment updated successfully",
        data: treatment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update treatment",
      });
    }
  }

  async createTreatmentAppointment(req, res) {
    try {
      const userId = req.user.id;
      const appointment = await treatmentService.createTreatmentAppointment(
        userId,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Treatment booking request created successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create treatment booking",
      });
    }
  }

  async getMyTreatmentAppointments(req, res) {
    try {
      const userId = req.user.id;
      const appointments = await treatmentService.getMyTreatmentAppointments(
        userId,
        req.query,
      );

      return res.status(200).json({
        success: true,
        message:
          appointments.length > 0
            ? "Treatment bookings retrieved successfully"
            : "No treatment bookings found",
        data: appointments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve treatment bookings",
      });
    }
  }

  async getAllTreatmentAppointments(req, res) {
    try {
      const result = await treatmentService.getAllTreatmentAppointments(
        req.query,
      );

      return res.status(200).json({
        success: true,
        message:
          result.appointments.length > 0
            ? "Treatment bookings retrieved successfully"
            : "No treatment bookings found",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve treatment bookings",
      });
    }
  }

  async reviewTreatmentAppointment(req, res) {
    try {
      const adminUserId = req.user.id;
      const treatmentAppointmentId = req.params.treatmentAppointmentId;

      const appointment = await treatmentService.reviewTreatmentAppointment(
        adminUserId,
        treatmentAppointmentId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: `Treatment booking ${req.body.decision} successfully`,
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to review treatment booking",
      });
    }
  }
}

export default new TreatmentController();
