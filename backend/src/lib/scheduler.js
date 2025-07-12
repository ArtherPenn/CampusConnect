import cron from "node-cron";
import { checkAndSendReminders } from "../controllers/event.controllers.js";

// Schedule to run every day at 9:00 AM
const startEventScheduler = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running event reminder check...');
    await checkAndSendReminders();
  });

  // Also run every hour to catch any missed reminders
  cron.schedule('0 * * * *', async () => {
    await checkAndSendReminders();
  });

  console.log('Event scheduler started');
};

export { startEventScheduler };