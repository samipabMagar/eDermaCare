import { Op } from "sequelize";
import { addDays, addMonths, isAfter, isBefore } from "date-fns";
import treatmentModel from "../models/treatmentModel.js";
import treatmentAppointmentModel from "../models/treatmentAppointmentModel.js";
import userModel from "../models/userModel.js";
import {
  sendTreatmentBookingReviewedEmail,
  sendTreatmentSessionReminderEmail,
} from "../utils/emailService.js";

const DEFAULT_TREATMENTS = [
  {
    name: "PRP Therapy",
    description:
      "Platelet-Rich Plasma treatment to improve skin texture, elasticity and overall glow.",
    image_url:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=800&fit=crop",
    benefit_tags: ["Collagen Boost", "Hair Growth", "Natural Healing"],
    duration_minutes: 90,
  },
  {
    name: "Microneedling",
    description:
      "Collagen-inducing treatment for acne scars, enlarged pores and uneven skin texture.",
    image_url:
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=800&fit=crop",
    benefit_tags: ["Collagen Production", "Pore Minimizing", "Scar Healing"],
    duration_minutes: 45,
  },
  {
    name: "CO2 Laser Resurfacing",
    description:
      "Fractional CO2 laser treatment targeting scars, pigmentation and deep wrinkles.",
    image_url:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop",
    benefit_tags: ["Scar Reduction", "Skin Tightening", "Texture Smoothing"],
    duration_minutes: 45,
  },
  {
    name: "Hydrafacial",
    description:
      "Deep cleansing, exfoliation and hydration treatment for instant skin refresh.",
    image_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop",
    benefit_tags: ["Deep Hydration", "Pore Cleansing", "Even Skin Tone"],
    duration_minutes: 60,
  },
  {
    name: "Chemical Peel",
    description:
      "Medical-grade peel to reduce dullness, pigmentation and uneven skin tone.",
    image_url:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=800&fit=crop",
    benefit_tags: ["Pigmentation Control", "Smooth Texture", "Brightening"],
    duration_minutes: 30,
  },
];

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

class TreatmentService {
  async seedDefaultTreatments() {
    for (const treatment of DEFAULT_TREATMENTS) {
      const slug = toSlug(treatment.name);
      const existing = await treatmentModel.findOne({
        where: {
          [Op.or]: [{ name: treatment.name }, { slug }],
        },
      });

      if (!existing) {
        await treatmentModel.create({
          ...treatment,
          slug,
          is_active: true,
        });
      }
    }
  }

  async listTreatments({ includeInactive = false } = {}) {
    const whereClause = includeInactive ? {} : { is_active: true };

    return await treatmentModel.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });
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

    return await treatmentAppointmentModel.create({
      user_id: userId,
      treatment_id: payload.treatment_id,
      session_date: sessionDate,
      reminder_frequency: payload.reminder_frequency,
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
          attributes: ["user_id", "full_name", "email"],
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

    if (appointment.reminder_frequency === "weekly") {
      const windowStart = addDays(sessionDate, -7);
      const inWindow =
        (isAfter(now, windowStart) ||
          now.getTime() === windowStart.getTime()) &&
        isBefore(now, sessionDate);

      if (!inWindow) {
        return false;
      }

      if (!lastSent) {
        return true;
      }

      return addDays(lastSent, 7) <= now;
    }

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
        reminderFrequency: appointment.reminder_frequency,
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
