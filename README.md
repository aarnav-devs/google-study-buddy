# Google Study Buddy

A student learning assistant built with React, TypeScript, and Vite. An Express
backend serves the website and connects chat to Gemini; the API key stays on
the server. The Android app packages the same web app using Capacitor.

## Run locally

Install dependencies with `npm install`, add `GEMINI_API_KEY=your-key` to
`.env.local`, then run `npm run dev`.

## Deploy and build

For Vercel, import the repository and add `GEMINI_API_KEY` in **Project
Settings → Environment Variables**, then deploy. Vercel builds the website and
serves the Express API as a serverless function.

To build and open the Android app, set `VITE_API_BASE_URL` in `.env.local` to
your Vercel URL, then run `npm run android`.
