// Email templates for doctor approval and rejection notifications
export const doctorApprovalEmailTemplate = (doctorName) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">eDermaCare</h1>
                        </td>
                    </tr>
                    
                    <!-- Success Icon -->
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #10b981; border-radius: 50%; display:flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 48px; line-height: 80px;">✓</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Congratulations, Dear Dr.${doctorName}!</h2>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                We are pleased to inform you that your doctor registration has been <strong style="color: #10b981;">approved</strong>.
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                You can now log in to your dashboard and start using the platform to connect with patients and provide quality healthcare services.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${process.env.CLIENT_URL || "#"}/login" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            Login to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                                Thank you for joining eDermaCare. We look forward to your contribution in providing excellent healthcare services.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                eDermaCare - Your Trusted Dermatology Platform
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} eDermaCare. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const doctorRejectionEmailTemplate = (doctorName, reason) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Status</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">eDermaCare</h1>
                        </td>
                    </tr>
                    
                    <!-- Icon -->
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #ef4444; border-radius: 50%; display:flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 48px; line-height: 80px;">✕</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Dear Dr.${doctorName},</h2>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                We regret to inform you that your doctor registration has not been approved at this time.
                            </p>
                            
                            <!-- Reason Box -->
                            <div style="margin: 25px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                                <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 14px;">
                                    Reason for rejection:
                                </p>
                                <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.6;">
                                    ${reason}
                                </p>
                            </div>
                            
                            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                If you believe this was an error or if you have any questions, please don't hesitate to contact our support team. We're here to help you through the registration process.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="mailto:support@edermacare.com" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            Contact Support
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                                Thank you for your interest in joining eDermaCare. We appreciate your understanding.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                eDermaCare - Your Trusted Dermatology Platform
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} eDermaCare. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const appointmentConfirmedEmailTemplate = ({
  patientName,
  doctorName,
  appointmentDateTime,
  meetingProvider,
  meetingLink,
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">eDermaCare</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <h2 style="margin: 0 0 18px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Appointment Confirmed</h2>

                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                Hello ${patientName}, your appointment with Dr. ${doctorName} has been confirmed.
                            </p>

                            <div style="margin: 25px 0; padding: 20px; background-color: #f0fdfa; border-left: 4px solid #2FA4A9; border-radius: 4px;">
                                <p style="margin: 0 0 8px; color: #0f766e; font-weight: 600; font-size: 14px;">Date & Time</p>
                                <p style="margin: 0 0 16px; color: #134e4a; font-size: 15px; line-height: 1.6;">${appointmentDateTime}</p>

                                <p style="margin: 0 0 8px; color: #0f766e; font-weight: 600; font-size: 14px;">Platform</p>
                                <p style="margin: 0 0 16px; color: #134e4a; font-size: 15px; line-height: 1.6;">${meetingProvider}</p>

                                <p style="margin: 0 0 8px; color: #0f766e; font-weight: 600; font-size: 14px;">Meeting Link</p>
                                <p style="margin: 0; word-break: break-all; color: #134e4a; font-size: 15px; line-height: 1.6;">${meetingLink}</p>
                            </div>

                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${meetingLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            Join Video Call
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                eDermaCare - Your Trusted Dermatology Platform
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} eDermaCare. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const appointmentRejectedEmailTemplate = ({
  patientName,
  doctorName,
  appointmentDateTime,
  rejectionReason,
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Rejected</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">eDermaCare</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <h2 style="margin: 0 0 18px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Appointment Update</h2>

                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                Hello ${patientName}, your appointment request with Dr. ${doctorName} on ${appointmentDateTime} was not approved.
                            </p>

                            <div style="margin: 25px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                                <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 14px;">Reason</p>
                                <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.6;">
                                    ${rejectionReason || "No reason was provided."}
                                </p>
                            </div>

                            <p style="margin: 0 0 16px; color: #4b5563; font-size: 15px; line-height: 1.6; text-align: center;">
                                Please open eDermaCare to book another appointment slot with this doctor or choose another available specialist.
                            </p>

                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${process.env.CLIENT_URL || "#"}/doctors" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #2FA4A9 0%, #288A8E 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            Browse Doctors
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                eDermaCare - Your Trusted Dermatology Platform
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} eDermaCare. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
