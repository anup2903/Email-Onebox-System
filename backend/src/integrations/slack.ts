import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

export const sendSlackNotification = async (emailSubject: string, from: string) => {
  if (!SLACK_WEBHOOK_URL) return;

  const message = {
    text: `*Interested Email Received*\n*From:* ${from}\n*Subject:* ${emailSubject}`,
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log("Slack notification sent.");
  } catch (err) {
    console.error("Failed to send Slack notification:", err);
  }
};
