import { Op, where, fn, col } from "sequelize";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import doctorProfileModel from "../models/doctorProfileModel.js";
import {
  sendAppointmentConfirmationEmail,
  sendAppointmentRejectionEmail,
} from "../utils/emailService.js";
import { format } from "date-fns";

class AppointmentService {
  async getBookedSlotsByDoctorAndDate(doctorUserId, dateString) {
    const parsedDoctorId = Number(doctorUserId);

    if (!Number.isInteger(parsedDoctorId) || parsedDoctorId <= 0) {
      throw new Error("Invalid doctor user id");
    }

    const parsedDate = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const doctorUser = await userModel.findByPk(parsedDoctorId, {
      attributes: ["user_id", "role"],
    });

    if (!doctorUser || doctorUser.role !== "doctor") {
      throw new Error("Selected doctor does not exist");
    }

    const bookedAppointments = await appointmentModel.findAll({
      attributes: ["scheduled_at"],
      where: {
        doctor_user_id: parsedDoctorId,
        status: {
          [Op.in]: ["pending", "confirmed"],
        },
        [Op.and]: [where(fn("DATE", col("scheduled_at")), dateString)],
      },
      order: [["scheduled_at", "ASC"]],
    });

    const bookedSlots = bookedAppointments.map((appointment) =>
      format(new Date(appointment.scheduled_at), "HH:mm"),
    );

    return {
      doctor_user_id: parsedDoctorId,
      date: dateString,
      booked_slots: bookedSlots,
    };
  }

  async createAppointment(patientUserId, appointmentData) {
    const { doctor_user_id, scheduled_at, patient_notes } = appointmentData;

    if (Number(patientUserId) === Number(doctor_user_id)) {
      throw new Error("You cannot book an appointment with yourself");
    }

    const doctorUser = await userModel.findByPk(doctor_user_id, {
      attributes: ["user_id", "full_name", "email", "role"],
    });

    if (!doctorUser || doctorUser.role !== "doctor") {
      throw new Error("Selected doctor does not exist");
    }

    const doctorProfile = await doctorProfileModel.findOne({
      where: {
        user_id: doctor_user_id,
        approval_status: "approved",
      },
    });

    if (!doctorProfile) {
      throw new Error("Doctor is not approved for appointments yet");
    }

    const scheduledAt = new Date(scheduled_at);

    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error("Invalid appointment date or time");
    }

    if (scheduledAt <= new Date()) {
      throw new Error(
        "Appointment must be scheduled for a future date and time",
      );
    }

    const conflictingAppointment = await appointmentModel.findOne({
      where: {
        doctor_user_id,
        scheduled_at: scheduledAt,
        status: {
          [Op.in]: ["pending", "confirmed"],
        },
      },
    });

    if (conflictingAppointment) {
      throw new Error(
        "Doctor already has an appointment at this date and time. Please choose another slot",
      );
    }

    const newAppointment = await appointmentModel.create({
      patient_user_id: patientUserId,
      doctor_user_id,
      scheduled_at: scheduledAt,
      patient_notes: patient_notes || null,
      status: "pending",
    });

    const appointment = await appointmentModel.findByPk(
      newAppointment.appointment_id,
      {
        include: [
          {
            model: userModel,
            as: "patient",
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: userModel,
            as: "doctor",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
      },
    );

    return appointment;
  }

  // Doctor confirms appointment and adds meeting details
  async confirmAppointment(doctorUserId, appointmentId, confirmationData) {
    const { meeting_provider, meeting_link, doctor_notes } = confirmationData;

    const appointment = await appointmentModel.findByPk(appointmentId, {
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (Number(appointment.doctor_user_id) !== Number(doctorUserId)) {
      throw new Error("You are not authorized to confirm this appointment");
    }

    if (appointment.status !== "pending") {
      throw new Error(
        `Only pending appointments can be confirmed. Current status: ${appointment.status}`,
      );
    }

    await appointment.update({
      status: "confirmed",
      meeting_provider,
      meeting_link,
      doctor_notes: doctor_notes || null,
    });

    const appointmentDateTime = format(
      new Date(appointment.scheduled_at),
      "MMMM d, yyyy 'at' h:mm a",
    );

    const meetingProviderLabel =
      meeting_provider === "google_meet" ? "Google Meet" : "Zoom";

    try {
      await sendAppointmentConfirmationEmail({
        patientEmail: appointment.patient.email,
        patientName: appointment.patient.full_name,
        doctorName: appointment.doctor.full_name,
        appointmentDateTime,
        meetingProvider: meetingProviderLabel,
        meetingLink: meeting_link,
      });
    } catch (error) {
      console.error("Failed to send appointment confirmation email:", error);
    }

    return appointment;
  }

  async getMyAppointments(currentUserId, currentUserRole, filters = {}) {
    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (currentUserRole === "user") {
      whereClause.patient_user_id = currentUserId;

      return await appointmentModel.findAll({
        where: whereClause,
        include: [
          {
            model: userModel,
            as: "doctor",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        order: [["scheduled_at", "ASC"]],
      });
    }

    if (currentUserRole === "doctor") {
      whereClause.doctor_user_id = currentUserId;

      return await appointmentModel.findAll({
        where: whereClause,
        include: [
          {
            model: userModel,
            as: "patient",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        order: [["scheduled_at", "ASC"]],
      });
    }

    throw new Error("Only users and doctors can view their appointments");
  }

  async completeAppointment(doctorUserId, appointmentId, completionData = {}) {
    const { doctor_notes } = completionData;

    const appointment = await appointmentModel.findByPk(appointmentId, {
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (Number(appointment.doctor_user_id) !== Number(doctorUserId)) {
      throw new Error("You are not authorized to complete this appointment");
    }

    if (appointment.status !== "confirmed") {
      throw new Error(
        `Only confirmed appointments can be completed. Current status: ${appointment.status}`,
      );
    }

    await appointment.update({
      status: "completed",
      doctor_notes:
        doctor_notes !== undefined ? doctor_notes : appointment.doctor_notes,
    });

    return appointment;
  }

  async cancelAppointment(
    currentUserId,
    currentUserRole,
    appointmentId,
    cancellationData = {},
  ) {
    const { cancellation_reason } = cancellationData;

    const appointment = await appointmentModel.findByPk(appointmentId, {
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    let cancelledBy;

    if (currentUserRole === "admin") {
      cancelledBy = "admin";
    } else if (
      currentUserRole === "user" &&
      Number(appointment.patient_user_id) === Number(currentUserId)
    ) {
      cancelledBy = "patient";
    } else if (
      currentUserRole === "doctor" &&
      Number(appointment.doctor_user_id) === Number(currentUserId)
    ) {
      cancelledBy = "doctor";
    } else {
      throw new Error("You are not authorized to cancel this appointment");
    }

    if (appointment.status === "cancelled") {
      throw new Error("Appointment is already cancelled");
    }

    if (appointment.status === "completed") {
      throw new Error("Completed appointments cannot be cancelled");
    }

    if (appointment.status === "rejected") {
      throw new Error("Rejected appointments cannot be cancelled");
    }

    await appointment.update({
      status: "cancelled",
      cancelled_by: cancelledBy,
      cancellation_reason: cancellation_reason || null,
      cancelled_at: new Date(),
    });

    return appointment;
  }

  async rejectAppointment(doctorUserId, appointmentId, rejectionData = {}) {
    const { rejection_reason } = rejectionData;

    const appointment = await appointmentModel.findByPk(appointmentId, {
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (Number(appointment.doctor_user_id) !== Number(doctorUserId)) {
      throw new Error("You are not authorized to reject this appointment");
    }

    if (appointment.status !== "pending") {
      throw new Error(
        `Only pending appointments can be rejected. Current status: ${appointment.status}`,
      );
    }

    await appointment.update({
      status: "rejected",
      doctor_notes:
        rejection_reason !== undefined
          ? rejection_reason
          : appointment.doctor_notes,
      meeting_provider: null,
      meeting_link: null,
    });

    const appointmentDateTime = format(
      new Date(appointment.scheduled_at),
      "MMMM d, yyyy 'at' h:mm a",
    );

    try {
      await sendAppointmentRejectionEmail({
        patientEmail: appointment.patient.email,
        patientName: appointment.patient.full_name,
        doctorName: appointment.doctor.full_name,
        appointmentDateTime,
        rejectionReason: rejection_reason || "No reason was provided.",
      });
    } catch (error) {
      console.error("Failed to send appointment rejection email:", error);
    }

    return appointment;
  }

  async getAllAppointmentsForAdmin(query = {}) {
    const {
      status,
      doctor_user_id,
      doctor,
      patient_user_id,
      patient,
      meeting_provider,
      cancelled_by,
      from,
      to,
      created_from,
      created_to,
      search,
      sortBy = "scheduled_at",
      sortOrder = "DESC",
      page = 1,
      limit = 10,
    } = query;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const offset = (safePage - 1) * safeLimit;

    const whereClause = {};

    const normalizedStatuses = String(status || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (normalizedStatuses.length === 1) {
      whereClause.status = normalizedStatuses[0];
    }

    if (normalizedStatuses.length > 1) {
      whereClause.status = {
        [Op.in]: normalizedStatuses,
      };
    }

    if (doctor_user_id) {
      const doctorUserId = Number(doctor_user_id);
      if (!Number.isNaN(doctorUserId) && doctorUserId > 0) {
        whereClause.doctor_user_id = doctorUserId;
      }
    }

    if (patient_user_id) {
      const patientUserId = Number(patient_user_id);
      if (!Number.isNaN(patientUserId) && patientUserId > 0) {
        whereClause.patient_user_id = patientUserId;
      }
    }

    if (meeting_provider) {
      whereClause.meeting_provider = String(meeting_provider).trim();
    }

    if (cancelled_by) {
      whereClause.cancelled_by = String(cancelled_by).trim();
    }

    if (from || to) {
      whereClause.scheduled_at = {};

      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          whereClause.scheduled_at[Op.gte] = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          whereClause.scheduled_at[Op.lte] = toDate;
        }
      }

      if (!Object.keys(whereClause.scheduled_at).length) {
        delete whereClause.scheduled_at;
      }
    }

    if (created_from || created_to) {
      whereClause.created_at = {};

      if (created_from) {
        const createdFromDate = new Date(created_from);
        if (!Number.isNaN(createdFromDate.getTime())) {
          whereClause.created_at[Op.gte] = createdFromDate;
        }
      }

      if (created_to) {
        const createdToDate = new Date(created_to);
        if (!Number.isNaN(createdToDate.getTime())) {
          whereClause.created_at[Op.lte] = createdToDate;
        }
      }

      if (!Object.keys(whereClause.created_at).length) {
        delete whereClause.created_at;
      }
    }

    const includeDoctorWhere = {};
    const includePatientWhere = {};

    const applyPersonFilter = (rawValue, targetWhere) => {
      const value = String(rawValue || "").trim();
      if (!value) return;

      const numericValue = Number(value);
      if (!Number.isNaN(numericValue) && numericValue > 0) {
        targetWhere.user_id = numericValue;
        return;
      }

      targetWhere[Op.or] = [
        { full_name: { [Op.like]: `%${value}%` } },
        { email: { [Op.like]: `%${value}%` } },
      ];
    };

    applyPersonFilter(doctor, includeDoctorWhere);
    applyPersonFilter(patient, includePatientWhere);

    if (search) {
      const safeSearch = String(search).trim();
      whereClause[Op.or] = [
        { "$patient.full_name$": { [Op.like]: `%${safeSearch}%` } },
        { "$patient.email$": { [Op.like]: `%${safeSearch}%` } },
        { "$doctor.full_name$": { [Op.like]: `%${safeSearch}%` } },
        { "$doctor.email$": { [Op.like]: `%${safeSearch}%` } },
      ];
    }

    const allowedSortFields = [
      "scheduled_at",
      "created_at",
      "updated_at",
      "status",
      "cancelled_at",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "scheduled_at";
    const safeSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const result = await appointmentModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "email"],
          ...(Object.keys(includePatientWhere).length
            ? { where: includePatientWhere, required: true }
            : {}),
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "email"],
          ...(Object.keys(includeDoctorWhere).length
            ? { where: includeDoctorWhere, required: true }
            : {}),
        },
      ],
      order: [[safeSortBy, safeSortOrder]],
      limit: safeLimit,
      offset,
      distinct: true,
      subQuery: false,
    });

    const total = Number(result.count || 0);
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      appointments: result.rows,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  async getAppointmentById(currentUserId, currentUserRole, appointmentId) {
    const appointment = await appointmentModel.findByPk(appointmentId, {
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (currentUserRole === "admin") {
      return appointment;
    }

    if (
      currentUserRole === "user" &&
      Number(appointment.patient_user_id) === Number(currentUserId)
    ) {
      return appointment;
    }

    if (
      currentUserRole === "doctor" &&
      Number(appointment.doctor_user_id) === Number(currentUserId)
    ) {
      return appointment;
    }

    throw new Error("You are not authorized to view this appointment");
  }
}

export default new AppointmentService();
