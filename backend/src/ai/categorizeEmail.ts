import genAI from './geminiClient';

const SYSTEM_PROMPT = `
You are an email assistant. Categorize the following email into exactly one of these categories:
- Interested
- Meeting Booked
- Not Interested
- Spam
- Out of Office

Respond only with the label name. No explanation.
`;

export async function categorizeEmail(emailText: string): Promise<string> {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


  const result = await model.generateContent([
    {
      text: `${SYSTEM_PROMPT}\n\nEmail:\n${emailText}`
    }
  ]);

  const response = await result.response.text();
  return response.trim();
}
