import admin from 'firebase-admin';
import { config } from '../config';

let initialized = false;

export function initFirebase(): void {
  if (initialized) return;
  const serviceAccount = JSON.parse(config.firebase.serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: config.firebase.projectId,
  });
  initialized = true;
}

export function getFirestore(): admin.firestore.Firestore {
  return admin.firestore();
}

export function getAuth(): admin.auth.Auth {
  return admin.auth();
}

export function serverTimestamp(): admin.firestore.FieldValue {
  return admin.firestore.FieldValue.serverTimestamp();
}
