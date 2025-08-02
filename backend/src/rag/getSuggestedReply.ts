import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const client = new ChromaClient();

export const getSuggestedReply = async (emailContent: string): Promise<string> => {
  const embedder = genAI.getGenerativeModel({ model: 'embedding-001' });

  const { embedding } = await embedder.embedContent(emailContent);
  const embeddingArray = embedding.values; // extract number[] properly

  const collection = await client.getCollection({ name: 'reply-data' });
  const results = await collection.query({
    queryEmbeddings: [embeddingArray],
    nResults: 1
  });

  if (
    !results.documents ||
    results.documents.length === 0 ||
    !results.documents[0] || 
    results.documents[0].length === 0
  ) {
    throw new Error("No relevant reply examples found.");
  }
  

  const retrieved = results.documents[0][0];

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Suggest a reply to: "${emailContent}" based on this example: "${retrieved}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
