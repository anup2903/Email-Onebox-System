import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { trainingData } from './trainingData';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const client = new ChromaClient({
    host: 'localhost',
    port: 8000,
    ssl: false,
  });

  export const embedAndStore = async () => {
    const embedder = genAI.getGenerativeModel({ model: 'embedding-001' });
    const collection = await client.getOrCreateCollection({ name: 'reply-data' });
  
    for (let i = 0; i < trainingData.length; i++) {
      const trainingDataItem = trainingData[i];
      if (!trainingDataItem) {
        console.warn(`Skipping undefined training data item at index ${i}`);
        continue;
      }
  
      const { input, output } = trainingDataItem;
  
      try {
        const { embedding } = await embedder.embedContent(input);
        const embeddingArray = embedding.values;
  
        await collection.add({
          ids: [`example-${i}`],
          embeddings: [embeddingArray],
          documents: [output],
        });
  
        console.log(`✅ Stored: example-${i}`);
  
      } catch (error) {
        console.error(`❌ Failed at index ${i}:`, error);
      }
    }
  
    console.log('🎉 All embeddings processed.');
  };
  
