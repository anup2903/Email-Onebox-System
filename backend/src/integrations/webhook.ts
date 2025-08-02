import axios from "axios";

const WEBHOOK_URL = process.env.WEBHOOK_URL || "";

export const triggerWebhook = async (emailSubject: string, from: string, body: string) => {
  if (!WEBHOOK_URL) return;

  try {
    await axios.post(WEBHOOK_URL, {
      from,
      subject: emailSubject,
      body,
      category: "Interested",
    });

    console.log("Webhook triggered.");
  } catch (err) {
    console.error("Webhook failed:", err);
  }
};
