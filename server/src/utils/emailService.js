import transporter from "../configs/email.js";
import {
  doctorApprovalEmailTemplate,
  doctorRejectionEmailTemplate,
  appointmentConfirmedEmailTemplate,
  appointmentRejectedEmailTemplate,
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
