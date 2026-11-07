# TrustLens — MERN MVP

AI-assisted news and claim credibility analysis using React, Express, MongoDB, optional OpenAI, and optional Tavily search.

## Features
- Register/login with bcrypt + JWT
- Submit text, URL, or claim
- URL fetching with basic SSRF protections
- Optional live web evidence retrieval (Tavily)
- Optional AI claim extraction and evidence assessment (OpenAI)
- Evidence-linked reports, history, dashboard, profile
- Admin source registry endpoints and seeded source list
- MongoDB persistence, request validation, rate limiting, Helmet, CORS
- Vitest frontend tests and Node test-ready backend structure

## Requirements
- Node.js 20+
- MongoDB local or Atlas
- Optional: OpenAI API key and Tavily API key

## Run locally

1. Copy `server/.env.example` to `server/.env` and configure `MONGODB_URI` and `JWT_SECRET`.
2. Copy `client/.env.example` to `client/.env`.
3. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```
4. Start both applications:
   ```bash
   npm run dev
   ```
   Frontend: http://localhost:5173  
   Backend: http://localhost:5000  
   Health: http://localhost:5000/api/v1/health

## Optional integrations
- `OPENAI_API_KEY`: enables model-based claim extraction and evidence assessment.
- `OPENAI_MODEL`: defaults to `gpt-4o-mini`.
- `TAVILY_API_KEY`: enables web search for evidence retrieval.

Without these keys, TrustLens still runs end-to-end, stores analyses, and returns `INSUFFICIENT_EVIDENCE` rather than fabricating sources or results. It uses the submitted claim as a basic claim when AI is unavailable. This is a development fallback, not equivalent to full fact-checking.

## Create an admin
Register a user, then promote it directly in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } })
```

## Important limitations
- Credibility labels are decision-support, not proof of truth.
- Search coverage depends on provider availability and indexing.
- URL extraction is best-effort and some publishers block automated fetching.
- Configure a production-grade queue, observability, stronger SSRF egress controls, email verification, refresh-token strategy, and calibrated confidence evaluation before public production use.

## Scripts
Root:
- `npm run dev`
- `npm run build`
- `npm run install:all`

Server:
- `npm run dev`
- `npm start`

Client:
- `npm run dev`
- `npm run build`
- `npm test`
