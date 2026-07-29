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
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (typeof window !== 'undefined') {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey && apiKey !== 'your_firebase_api_key' && !apiKey.includes('Dummy')) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      auth = getAuth(app);
    } else {
      console.warn('⚠️ Firebase API key no configurada o es inválida. Firebase Auth pausado.');
    }
  } catch (error) {
    console.error('⚠️ Error al inicializar Firebase:', error);
  }
}

export { app, auth };
