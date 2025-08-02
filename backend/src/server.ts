import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import { initIMAPSync } from './imap/imapClient';
import { categorizeEmail } from './ai/categorizeEmail';
import { sendSlackNotification } from './integrations/slack';
import { triggerWebhook } from './integrations/webhook';
import { searchEmails, indexEmail } from './elastic/elasticsearch';
import { getSuggestedReply } from './rag/getSuggestedReply';



export type EmailData = {
  subject: string;
  from: string;
  date: Date;
  folder: string;
  account: string;
  label?: string;
};


const app = express();

const PORT = 3001;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Email Onebox Backend Running');
});

// 🔍 Get all emails 
app.get('/emails', async (req, res) => {
  const { label, folder, account } = req.query;

  const query: any = {
    bool: { must: [] }
  };

  if (label) query.bool.must.push({ match: { label } });
  if (folder) query.bool.must.push({ match: { folder } });
  if (account) query.bool.must.push({ match_phrase: { account } });

  try {
    const results = await searchEmails(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching emails:', err);
    res.status(500).json({ error: 'Failed to fetch emails', details: err });
  }
});

app.post('/suggest-reply', async (req, res) => {
  const { emailText } = req.body;

  if (!emailText) {
    return res.status(400).json({ error: 'emailText is required' });
  }

  try {
    const reply = await getSuggestedReply(emailText);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate reply', details: err });
  }
});

// slack + webhooks integration along with categorization
const handleEmail = async (email: EmailData) => {
  const { subject, from } = email;

  try {
    const label = await categorizeEmail(subject);
    console.log(`[${from}] labeled as: ${label}`);

    const emailWithLabel = { ...email, label };
    await indexEmail(emailWithLabel); 

    if (label === 'Interested') {
      await sendSlackNotification(subject, from);
      await triggerWebhook(subject, from, '');
    }
  } catch (err) {
    console.error(`Categorization failed for ${subject}:`, err);
  }
};

app.listen(PORT, async () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
  await initIMAPSync(handleEmail);
});
