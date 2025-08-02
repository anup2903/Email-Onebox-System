# Email-Onebox-System

# Frontend

Tech Stack

React + TypeScript
Vite
Axios

Setting up the frontend

1. cd frontend
2. npm install
3. npm run dev

# Backend

Tech Stack :

Node.js + TypeScript
Express
ts-node-dev
ChromaDB (local)
Google Generative AI SDK
CORS

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