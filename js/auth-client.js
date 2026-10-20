import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import * as authSDK from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

export async function getFirebase() {
    const app = getApps().length ? getApp() : initializeApp(window.FITTRACK_FIREBASE_CONFIG);
    const auth = authSDK.getAuth(app);
    auth.languageCode = "es";
    await auth.authStateReady();
    return { app, auth, authSDK };
}
