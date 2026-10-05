<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Railway

In the Railway service's **Variables** settings, add `GEMINI_API_KEY` with a valid
Gemini API key, then redeploy the service. `.env.local` is intentionally not
committed, so its local key is not available to Railway. Do not name the variable
`VITE_GEMINI_API_KEY`; that would expose the key in the browser bundle.

That's the only required app variable: Railway provides `PORT`, and the Gemini
model defaults to `gemini-2.5-flash`. Check the Railway deployment logs if chat
still returns generic fallback replies: a missing-key warning means the service
variable is absent, while a "Gemini API call failed" message indicates the key,
model, or Gemini API request needs attention.

## Android

Capacitor packages the Vite `dist` build. Before building Android, set `VITE_API_BASE_URL` in `.env.local` to the deployed HTTPS URL for this app's Express backend. Keep `GEMINI_API_KEY` server-side; it must not use a `VITE_` prefix. Configure the backend's `CORS_ORIGINS` with `https://localhost` for the Capacitor Android origin and any hosted web origins that need access.

Then run:

1. `npm install`
2. `npm run android`

Android Studio opens the generated `android` project. To create a signed APK or AAB, use **Build > Generate Signed Bundle / APK** in Android Studio and select APK or Android App Bundle.
