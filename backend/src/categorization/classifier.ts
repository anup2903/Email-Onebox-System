import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const labels = [
  "Interested",
  "Meeting Booked",
  "Not Interested",
  "Spam",
  "Out of Office",
];

export async function categorizeEmail(subject: string, body: string) {
  const prompt = `Categorize the following email into one of the labels: ${labels.join(", ")}.

Email:
Subject: ${subject}
Body: ${body}

Label:`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 10,
    temperature: 0,
  });

  const label = response.choices[0]?.message?.content?.trim();
  return label;
}
