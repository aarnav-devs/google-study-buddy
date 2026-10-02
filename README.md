<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b507bc8c-03e3-4acd-8b49-e8815549d725

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Android

Capacitor packages the Vite `dist` build. Before building Android, set `VITE_API_BASE_URL` in `.env.local` to the deployed HTTPS URL for this app's Express backend. Keep `GEMINI_API_KEY` server-side; it must not use a `VITE_` prefix. Configure the backend's `CORS_ORIGINS` with `https://localhost` for the Capacitor Android origin and any hosted web origins that need access.

Then run:

1. `npm install`
2. `npm run android`

Android Studio opens the generated `android` project. To create a signed APK or AAB, use **Build > Generate Signed Bundle / APK** in Android Studio and select APK or Android App Bundle.
