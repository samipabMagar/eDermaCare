import { Resend } from "resend";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

class ContactService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async submitContactMessage(payload) {
    const { name, email, subject, message } = payload;

    if (
      !process.env.RESEND_API_KEY ||
      !process.env.RESEND_FROM_EMAIL ||
      !process.env.CONTACT_FORM_TO_EMAIL
    ) {
      throw new Error("Contact email is not configured on the server");
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    const { data, error } = await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.CONTACT_FORM_TO_EMAIL],
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">New Contact Form Submission</h2>
          <p style="margin: 0 0 16px; color: #475569;">A user sent a message from the eDermaCare contact page.</p>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">${safeMessage}</div>
        </div>
      `,
      text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    if (error) {
      throw new Error(error.message || "Failed to send contact email");
    }

    return {
      email_id: data?.id || null,
    };
  }
}

export default new ContactService();
