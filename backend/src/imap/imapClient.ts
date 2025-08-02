// imapClient.ts
import { ImapFlow } from 'imapflow';
import { indexEmail } from '../elastic/elasticsearch';
import * as dotenv from 'dotenv';

dotenv.config();

export type EmailData = {
  subject: string;
  from: string;
  date: Date;
  folder: string;
  account: string;
};

type EmailHandler = (email: EmailData) => Promise<void>;

const connectIMAP = async (
  user: string,
  pass: string,
  host: string,
  port: number,
  folderName = 'INBOX',
  onEmailProcessed?: EmailHandler
) => {
  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass }
  });

  await client.connect();
  console.log(`✅ Connected to ${user}`);

  const lock = await client.getMailboxLock(folderName);
  try {
    let messageCount = 0;
    if (client.mailbox && typeof client.mailbox !== 'boolean') {
      messageCount = client.mailbox.exists;
}

    const start = Math.max(1, messageCount - 5);

    const messages = client.fetch(`${start}:${messageCount}`, {
      envelope: true,
      source: true
    });

    for await (const message of messages) {
      const { subject, from, date } = message.envelope ?? {};
      if (!subject || !from || !date) continue;

      const emailData: EmailData = {
        subject,
        from: from?.[0]?.address ?? '',
        date,
        folder: folderName,
        account: user,
      };

      await indexEmail(emailData);

      if (onEmailProcessed) {
        await onEmailProcessed(emailData);
      }
    }
  } catch (err) {
    console.error(`❌ Error syncing ${user}:`, err);
  } finally {
    client.logout();
    console.log(`🔌 Disconnected from ${user}`);
  }
};

export const initIMAPSync = async (onEmailProcessed?: EmailHandler) => {
  await connectIMAP(
    process.env.IMAP_USER1!,
    process.env.IMAP_PASS1!,
    process.env.IMAP_HOST1!,
    Number(process.env.IMAP_PORT1!),
    'INBOX',
    onEmailProcessed
  );

  await connectIMAP(
    process.env.IMAP_USER2!,
    process.env.IMAP_PASS2!,
    process.env.IMAP_HOST2!,
    Number(process.env.IMAP_PORT2!),
    'INBOX',
    onEmailProcessed
  );
};
