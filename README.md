# Email-Onebox-System

# Architecture Overview
The system is split into two main parts: Frontend and Backend, with clear separation of concerns.

1. Frontend (React + Vite)
   
Developed with React (TypeScript) and bundled via Vite for fast development.

Handles the UI and user interactions.

Communicates with the backend via Axios HTTP requests.

Displays processed email data and generated responses from the AI model.


2. Backend (Node.js + Express)
   
Built with Express.js (TypeScript).

Connects to multiple IMAP email accounts using persistent connections with IDLE support for real-time email fetching.

Sends real-time Slack notifications when new emails are received based on google AI tags recommendation.

CORS-enabled API endpoints.


3. ChromaDB (Vector DB)
   
Stores vector embeddings of email data for fast semantic search.

Used during the AI reply generation to retrieve relevant context (RAG pipeline).


4. Slack Integration
Sends notifications to a configured Slack channel when new emails are fetched.

Done using Slack Incoming Webhooks.

# Features Implemented

1. Email Sync and Fetching
Connects to two IMAP accounts.

2. Maintains persistent IMAP IDLE connections for near real-time email syncing.

3. Fetches and parses the latest 30 days of emails on startup.

4. Slack Notifications
Sends a Slack alert every time a new email is received.

5. RESTful API
Provides API endpoints for:

6. Fetching stored email summaries.


✅ Frontend UI
Simple and fast React + Vite interface.

Displays email threads and generated replies.

Allows triggering of reply generation via button click.

✅ Environment Configuration
All secrets and credentials are managed via a .env file.

Easy to switch IMAP accounts or Slack URLs.



# Frontend

Tech Stack

1. React + TypeScript
2. Vite
3. Axios

Setting up the frontend

1. cd frontend
2. npm install
3. npm run dev

# Backend

Tech Stack :

1. Node.js + TypeScript
2. Express
3. ts-node-dev
4. ChromaDB (local)
5. Google Generative AI SDK
6. CORS

Setting up the backend
1. cd backend
2. npm install
3. Set up your ENV file in this manner

`
IMAP_USER1=your_email@gmail.com
IMAP_PASS1=your_IMAP_password
IMAP_HOST1=imap.gmail.com
IMAP_PORT1=993

IMAP_USER2=your_email@gmail.com
IMAP_PASS2=your_IMAP_password
IMAP_HOST2=imap.gmail.com
IMAP_PORT2=993

GEMINI_API_KEY=YOUR_API_KEY

SLACK_WEBHOOK_URL=YOUR_WEBHOOK_URL
`
4. npm run dev

