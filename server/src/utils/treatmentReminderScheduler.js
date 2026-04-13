import cron from "node-cron";
import treatmentService from "../services/treatmentService.js";

let hasStarted = false;

export const startTreatmentReminderScheduler = () => {
  if (hasStarted) {
    return;
  }

  hasStarted = true;

  cron.schedule("0 9 * * *", async () => {
    try {
      const appointments =
        await treatmentService.getApprovedAppointmentsForReminder();

      for (const appointment of appointments) {
        await treatmentService.sendTreatmentReminderIfDue(appointment);
      }
    } catch (error) {
      console.error("Treatment reminder scheduler failed:", error);
    }
  });

  console.log("Treatment reminder scheduler started (runs daily at 09:00)");
};
