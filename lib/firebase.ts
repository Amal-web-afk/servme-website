import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore 
} from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// ==========================================
// ENVIRONMENT VARIABLES VALIDATION
// ==========================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ==========================================
// FIREBASE APP AND SERVICES SETUP
// ==========================================

// Safe initialization for Next.js build time (prevents crash if env vars are missing on Netlify build servers)
let app;
try {
  if (getApps().length === 0) {
    if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
    } else {
      // Create a dummy app to satisfy the build process
      console.warn("Firebase API Key is missing. Initializing dummy Firebase app for build process.");
      app = initializeApp({ apiKey: "dummy-key", projectId: "dummy-project" }, "dummy");
    }
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Firebase initialization error", error);
  app = getApps()[0];
}

let db: Firestore;

if (typeof window !== "undefined") {
  // Initialize Firestore on client-side with multi-tab offline cache support
  // Only use persistent cache if it's the real app (not the dummy build app)
  if (app.name !== "dummy") {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } else {
    db = initializeFirestore(app, {});
  }
} else {
  // SSR / Server Component instance (simple setup)
  db = initializeFirestore(app, {});
}

// Safely get Auth and Storage (will return instances tied to the dummy app during build, but real instances in production)
let auth: Auth;
let storage: FirebaseStorage;

try {
  auth = getAuth(app);
  storage = getStorage(app);
} catch (e) {
  console.warn("Firebase Auth/Storage initialization skipped during build.");
}

export { app, db, auth, storage };
