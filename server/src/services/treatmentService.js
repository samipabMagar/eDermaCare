import { Op } from "sequelize";
import { addMonths, isAfter, isBefore } from "date-fns";
import treatmentModel from "../models/treatmentModel.js";
import treatmentAppointmentModel from "../models/treatmentAppointmentModel.js";
import userModel from "../models/userModel.js";
import {
  sendTreatmentBookingReviewedEmail,
  sendTreatmentSessionReminderEmail,
} from "../utils/emailService.js";

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

const NEPAL_TIMEZONE = "Asia/Kathmandu";

const getNepalWeekday = (date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: NEPAL_TIMEZONE,
    weekday: "short",
  }).format(date);

const getNepalTimeInMinutes = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NEPAL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((item) => item.type === "hour")?.value || 0);
  const minute = Number(
    parts.find((item) => item.type === "minute")?.value || 0,
  );

  return hour * 60 + minute;
};

const isNepalBookingWindow = (date) => {
  const weekday = getNepalWeekday(date);
  if (weekday === "Sat") {
    return false;
  }

  const timeInMinutes = getNepalTimeInMinutes(date);
  const startMinutes = 9 * 60;
  const endMinutes = 18 * 60;

  return timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
};

class TreatmentService {
  async listTreatments({
    includeInactive = false,
    search,
    sort,
    page,
    limit,
  } = {}) {
    const whereClause = includeInactive ? {} : { is_active: true };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const rows = await treatmentModel.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    const treatments = [...rows];

    if (sort === "price-low") {
      treatments.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === "price-high") {
      treatments.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sort === "duration") {
      treatments.sort(
        (a, b) =>
          Number(a.duration_minutes || 0) - Number(b.duration_minutes || 0),
      );
    } else {
      treatments.sort((a, b) => a.name.localeCompare(b.name));
    }

    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const hasPagination =
      Number.isInteger(parsedPage) &&
      parsedPage > 0 &&
      Number.isInteger(parsedLimit) &&
      parsedLimit > 0;

    if (!hasPagination) {
      return {
        treatments,
        pagination: null,
      };
    }

    const totalItems = treatments.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / parsedLimit));
    const safePage = Math.min(parsedPage, totalPages);
    const start = (safePage - 1) * parsedLimit;
    const end = start + parsedLimit;

    return {
      treatments: treatments.slice(start, end),
      pagination: {
        page: safePage,
        limit: parsedLimit,
        totalItems,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
      },
    };
  }

  async createTreatment(payload) {
    const slug = toSlug(payload.name);

    const existing = await treatmentModel.findOne({
      where: {
        [Op.or]: [{ name: payload.name }, { slug }],
      },
    });

    if (existing) {
      throw new Error("Treatment with similar name already exists");
    }

    return await treatmentModel.create({
      name: payload.name,
      slug,
      description: payload.description || null,
      price: payload.price ?? null,
      image_url: payload.image_url || null,
      benefit_tags: payload.benefit_tags || [],
      duration_minutes: payload.duration_minutes || null,
      is_active: payload.is_active ?? true,
    });
  }

  async updateTreatment(treatmentId, payload) {
    const treatment = await treatmentModel.findByPk(treatmentId);

    if (!treatment) {
      throw new Error("Treatment not found");
    }

    const updateData = {};

    if (payload.name !== undefined) {
      const nextSlug = toSlug(payload.name);

      const existing = await treatmentModel.findOne({
        where: {
          treatment_id: { [Op.ne]: treatment.treatment_id },
          [Op.or]: [{ name: payload.name }, { slug: nextSlug }],
        },
      });

      if (existing) {
        throw new Error("Treatment with similar name already exists");
      }

      updateData.name = payload.name;
      updateData.slug = nextSlug;
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description || null;
    }

    if (payload.price !== undefined) {
      updateData.price = payload.price;
    }

    if (payload.image_url !== undefined) {
      updateData.image_url = payload.image_url || null;
    }

    if (payload.benefit_tags !== undefined) {
      updateData.benefit_tags = payload.benefit_tags || [];
    }

    if (payload.duration_minutes !== undefined) {
      updateData.duration_minutes = payload.duration_minutes || null;
    }

    if (payload.is_active !== undefined) {
      updateData.is_active = payload.is_active;
    }

    await treatment.update(updateData);
    return treatment;
  }

  async deleteTreatment(treatmentId) {
    const treatment = await treatmentModel.findByPk(treatmentId);

    if (!treatment) {
      throw new Error("Treatment not found");
    }

    const linkedAppointmentsCount = await treatmentAppointmentModel.count({
      where: {
        treatment_id: treatment.treatment_id,
      },
    });

    if (linkedAppointmentsCount > 0) {
      throw new Error(
        `Cannot delete treatment because ${linkedAppointmentsCount} booking(s) exist for it. Delete the related bookings first.`,
      );
    }

    await treatment.destroy();
    return treatment;
  }

  async createTreatmentAppointment(userId, payload) {
    const treatment = await treatmentModel.findByPk(payload.treatment_id);

    if (!treatment || !treatment.is_active) {
      throw new Error("Selected treatment does not exist or is inactive");
    }

    const sessionDate = new Date(payload.session_date);

    if (Number.isNaN(sessionDate.getTime())) {
      throw new Error("Invalid session date or time");
    }

    if (sessionDate <= new Date()) {
      throw new Error("Session date must be in the future");
    }

    if (!isNepalBookingWindow(sessionDate)) {
      throw new Error(
        "Booking is available Sunday to Friday between 9:00 AM and 6:00 PM Nepal time",
      );
    }

    return await treatmentAppointmentModel.create({
      user_id: userId,
      treatment_id: payload.treatment_id,
      session_date: sessionDate,
      reminder_frequency: "monthly",
      user_notes: payload.user_notes || null,
      status: "pending",
    });
  }

  async getMyTreatmentAppointments(userId, query = {}) {
    const whereClause = {
      user_id: userId,
    };

    if (query.status) {
      whereClause.status = query.status;
    }

    return await treatmentAppointmentModel.findAll({
      where: whereClause,
      include: [
        {
          model: treatmentModel,
          as: "treatment",
          attributes: ["treatment_id", "name", "slug", "description"],
        },
        {
          model: userModel,
          as: "reviewedByAdmin",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
      order: [["session_date", "ASC"]],
    });
  }

  async getAllTreatmentAppointments(query = {}) {
    const {
      status,
      user_id,
      treatment_id,
      from,
      to,
      page = 1,
      limit = 10,
    } = query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (user_id) {
      whereClause.user_id = Number(user_id);
    }

    if (treatment_id) {
      whereClause.treatment_id = Number(treatment_id);
    }

    if (from || to) {
      whereClause.session_date = {};
      if (from) {
        whereClause.session_date[Op.gte] = new Date(from);
      }
      if (to) {
        whereClause.session_date[Op.lte] = new Date(to);
      }
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const offset = (safePage - 1) * safeLimit;

    const result = await treatmentAppointmentModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: treatmentModel,
          as: "treatment",
          attributes: ["treatment_id", "name", "slug"],
        },
        {
          model: userModel,
          as: "user",
          attributes: ["user_id", "full_name", "email", "phone", "gender"],
        },
        {
          model: userModel,
          as: "reviewedByAdmin",
          attributes: ["user_id", "full_name", "email"],
        },
      ],
      order: [["session_date", "ASC"]],
      limit: safeLimit,
      offset,
      distinct: true,
    });

    const total = result.count;
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      appointments: result.rows,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  }

  async reviewTreatmentAppointment(
    adminUserId,
    treatmentAppointmentId,
    payload,
  ) {
    const appointment = await treatmentAppointmentModel.findByPk(
      treatmentAppointmentId,
      {
        include: [
          {
            model: treatmentModel,
            as: "treatment",
            attributes: ["name"],
          },
          {
            model: userModel,
            as: "user",
            attributes: ["full_name", "email"],
          },
        ],
      },
    );

    if (!appointment) {
      throw new Error("Treatment booking not found");
    }

    if (appointment.status !== "pending") {
      throw new Error(
        `Only pending bookings can be reviewed. Current status: ${appointment.status}`,
      );
    }

    if (payload.decision === "rejected" && !payload.rejection_reason) {
      throw new Error("rejection_reason is required when decision is rejected");
    }

    await appointment.update({
      status: payload.decision,
      admin_notes: payload.admin_notes || null,
      rejection_reason:
        payload.decision === "rejected" ? payload.rejection_reason : null,
      reviewed_by_admin_id: adminUserId,
      reviewed_at: new Date(),
      last_reminder_sent_at: null,
    });

    try {
      await sendTreatmentBookingReviewedEmail({
        userEmail: appointment.user.email,
        userName: appointment.user.full_name,
        treatmentName: appointment.treatment.name,
        sessionDate: appointment.session_date,
        decision: payload.decision,
        rejectionReason: payload.rejection_reason || null,
      });
    } catch (error) {
      console.error("Failed to send treatment booking review email:", error);
    }

    return appointment;
  }

  async getApprovedAppointmentsForReminder() {
    return await treatmentAppointmentModel.findAll({
      where: {
        status: "approved",
        session_date: {
          [Op.gt]: new Date(),
        },
      },
      include: [
        {
          model: treatmentModel,
          as: "treatment",
          attributes: ["name"],
        },
        {
          model: userModel,
          as: "user",
          attributes: ["full_name", "email"],
        },
      ],
      order: [["session_date", "ASC"]],
    });
  }

  shouldSendReminder(appointment, now = new Date()) {
    const sessionDate = new Date(appointment.session_date);

    if (!isAfter(sessionDate, now)) {
      return false;
    }

    const lastSent = appointment.last_reminder_sent_at
      ? new Date(appointment.last_reminder_sent_at)
      : null;

    const windowStart = addMonths(sessionDate, -1);
    const inWindow =
      (isAfter(now, windowStart) || now.getTime() === windowStart.getTime()) &&
      isBefore(now, sessionDate);

    if (!inWindow) {
      return false;
    }

    if (!lastSent) {
      return true;
    }

    return addMonths(lastSent, 1) <= now;
  }

  async sendTreatmentReminderIfDue(appointment) {
    if (!this.shouldSendReminder(appointment)) {
      return false;
    }

    try {
      await sendTreatmentSessionReminderEmail({
        userEmail: appointment.user.email,
        userName: appointment.user.full_name,
        treatmentName: appointment.treatment.name,
        sessionDate: appointment.session_date,
        reminderFrequency: "monthly",
      });

      await appointment.update({
        last_reminder_sent_at: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Failed to send treatment reminder email:", error);
      return false;
    }
  }
}

export default new TreatmentService();
