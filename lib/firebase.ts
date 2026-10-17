import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  Firestore,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration is provided through public Expo env vars
 * (EXPO_PUBLIC_*). These values are safe to ship in a client bundle: they only
 * identify the project, and access is governed by Firestore/Storage security
 * rules (public read, admin-only write). See .env.example for the keys.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * `experimentalForceLongPolling` is required for reliable Firestore connections
 * in React Native, where the default streaming transport often stalls.
 * We use an in-memory cache; cross-launch offline support is provided by our
 * own AsyncStorage snapshot layer in `lib/content/contentCache.ts`.
 */
export const db: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: memoryLocalCache(),
});

export const storage = getStorage(app);

/**
 * Auth is used only by the content editor (web). On web, Firebase persists the
 * session in the browser automatically. On native it defaults to in-memory
 * persistence (the editor is web-first), which is fine because surgeons never
 * authenticate.
 */
export const auth: Auth | null = isFirebaseConfigured ? getAuth(app) : null;

export default app;
