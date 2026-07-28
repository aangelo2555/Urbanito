/**
 * Firebase Config - Solo Auth
 * El resto de funcionalidades (DB, Storage) ahora usan Railway
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Inicializar Firebase solo una vez (solo Auth)
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
  // Solo inicializar en el cliente
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
}

export { app, auth };
