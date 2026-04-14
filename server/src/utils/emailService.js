import transporter from "../configs/email.js";
import { format } from "date-fns";
import {
  doctorApprovalEmailTemplate,
  doctorRejectionEmailTemplate,
  appointmentConfirmedEmailTemplate,
  appointmentRejectedEmailTemplate,
  treatmentBookingReviewedEmailTemplate,
  treatmentReminderEmailTemplate,
} from "../helpers/emailHelper.js";

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Function to send doctor approval email
export const sendDoctorApprovalEmail = async (email, doctorName) => {
  const subject = "Doctor Registration Approved - eDermaCare";
  const html = doctorApprovalEmailTemplate(doctorName);

  return await sendEmail(email, subject, html);
};

// Function to send doctor rejection email
export const sendDoctorRejectionEmail = async (email, doctorName, reason) => {
  const subject = "Doctor Registration Rejected - eDermaCare";
  const html = doctorRejectionEmailTemplate(doctorName, reason);

  return await sendEmail(email, subject, html);
};

// Function to send appointment confirmation email
export const sendAppointmentConfirmationEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDateTime,
  meetingProvider,
  meetingLink,
}) => {
  const subject = "Appointment Confirmed - eDermaCare";
  const html = appointmentConfirmedEmailTemplate({
    patientName,
    doctorName,
    appointmentDateTime,
    meetingProvider,
    meetingLink,
  });

  return await sendEmail(patientEmail, subject, html);
};

export const sendAppointmentRejectionEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDateTime,
  rejectionReason,
}) => {
  const subject = "Appointment Request Update - eDermaCare";
  const html = appointmentRejectedEmailTemplate({
    patientName,
    doctorName,
    appointmentDateTime,
    rejectionReason,
  });

  return await sendEmail(patientEmail, subject, html);
};

export const sendTreatmentBookingReviewedEmail = async ({
  userEmail,
  userName,
  treatmentName,
  sessionDate,
  decision,
  rejectionReason,
}) => {
  const sessionDateTime = format(
    new Date(sessionDate),
    "MMMM d, yyyy 'at' h:mm a",
  );

  const subject =
    decision === "approved"
      ? "Treatment Booking Approved - eDermaCare"
      : "Treatment Booking Rejected - eDermaCare";

  const html = treatmentBookingReviewedEmailTemplate({
    userName,
    treatmentName,
    sessionDateTime,
    decision,
    rejectionReason,
  });

  return await sendEmail(userEmail, subject, html);
};

export const sendTreatmentSessionReminderEmail = async ({
  userEmail,
  userName,
  treatmentName,
  sessionDate,
  reminderFrequency,
}) => {
  const sessionDateTime = format(
    new Date(sessionDate),
    "MMMM d, yyyy 'at' h:mm a",
  );

  const subject = `Treatment Session Reminder (${reminderFrequency}) - eDermaCare`;

  const html = treatmentReminderEmailTemplate({
    userName,
    treatmentName,
    sessionDateTime,
    reminderFrequency,
  });

  return await sendEmail(userEmail, subject, html);
};
