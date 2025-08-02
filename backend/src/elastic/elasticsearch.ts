import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({
  node: 'http://localhost:9200',
});

// Function to index an email document
export const indexEmail = async (email: any) => {
    const id = `${email.account}-${email.date}-${email.subject}`;
    await esClient.index({
      index: 'emails',
      id,
      document: email,
    });
  };
  

// Function to search emails by query
export const searchEmails = async (query: any) => {
  const result = await esClient.search({
    index: 'emails',
    query,
    size:20
  });

  return result.hits.hits.map((hit: any) => hit._source);
};

// Function to delete all indexed emails
export const clearAllEmails = async () => {
    try {
      const response = await esClient.deleteByQuery({
        index: 'emails',
        query: {
          match_all: {}
        }
      });
      console.log("All documents deleted from 'emails' index");
      console.log(`Deleted ${response.deleted} documents`);
    } catch (error) {
      console.error("Error deleting documents from 'emails' index:", error);
    }
  };
