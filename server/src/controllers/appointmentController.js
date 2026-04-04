import appointmentService from "../services/appointmentService.js";

class AppointmentController {
  async getDoctorBookedSlots(req, res) {
    try {
      const { doctorUserId } = req.params;
      const { date } = req.query;

      const result = await appointmentService.getBookedSlotsByDoctorAndDate(
        doctorUserId,
        date,
      );

      return res.status(200).json({
        success: true,
        message: "Booked slots retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve booked slots",
      });
    }
  }

  async createAppointment(req, res) {
    try {
      const patientUserId = req.user.id;
      const appointmentData = req.body;

      const appointment = await appointmentService.createAppointment(
        patientUserId,
        appointmentData,
      );

      return res.status(201).json({
        success: true,
        message: "Appointment request created successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create appointment",
      });
    }
  }

  async confirmAppointment(req, res) {
    try {
      const doctorUserId = req.user.id;
      const appointmentId = req.params.appointmentId;
      const confirmationData = req.body;

      const appointment = await appointmentService.confirmAppointment(
        doctorUserId,
        appointmentId,
        confirmationData,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment confirmed successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to confirm appointment",
      });
    }
  }

  async getMyAppointments(req, res) {
    try {
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;
      const filters = {
        status: req.query.status,
      };

      const appointments = await appointmentService.getMyAppointments(
        currentUserId,
        currentUserRole,
        filters,
      );

      return res.status(200).json({
        success: true,
        message:
          appointments.length > 0
            ? "Appointments retrieved successfully"
            : "No appointments found",
        data: appointments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve appointments",
      });
    }
  }

  async completeAppointment(req, res) {
    try {
      const doctorUserId = req.user.id;
      const appointmentId = req.params.appointmentId;
      const completionData = req.body;

      const appointment = await appointmentService.completeAppointment(
        doctorUserId,
        appointmentId,
        completionData,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment marked as completed successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to complete appointment",
      });
    }
  }

  async cancelAppointment(req, res) {
    try {
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;
      const appointmentId = req.params.appointmentId;
      const cancellationData = req.body;

      const appointment = await appointmentService.cancelAppointment(
        currentUserId,
        currentUserRole,
        appointmentId,
        cancellationData,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel appointment",
      });
    }
  }

  async rejectAppointment(req, res) {
    try {
      const doctorUserId = req.user.id;
      const appointmentId = req.params.appointmentId;
      const rejectionData = req.body;

      const appointment = await appointmentService.rejectAppointment(
        doctorUserId,
        appointmentId,
        rejectionData,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment rejected successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to reject appointment",
      });
    }
  }

  //
  async getAllAppointmentsForAdmin(req, res) {
    try {
      const appointments = await appointmentService.getAllAppointmentsForAdmin(
        req.query,
      );

      return res.status(200).json({
        success: true,
        message:
          appointments.appointments.length > 0
            ? "Appointments retrieved successfully"
            : "No appointments found",
        data: appointments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve appointments",
      });
    }
  }

  async getAppointmentById(req, res) {
    try {
      const appointmentId = req.params.appointmentId;
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;

      const appointment = await appointmentService.getAppointmentById(
        currentUserId,
        currentUserRole,
        appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment retrieved successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve appointment",
      });
    }
  }
}

export default new AppointmentController();
