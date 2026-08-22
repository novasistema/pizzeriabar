import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey || "AIzaSyCjBbYhKreFS0kUEjP7UiZglHE-MvRo7GQ",
  authDomain: firebaseConfigData.authDomain || "gen-lang-client-0721502809.firebaseapp.com",
  projectId: firebaseConfigData.projectId || "gen-lang-client-0721502809",
  storageBucket: firebaseConfigData.storageBucket || "gen-lang-client-0721502809.firebasestorage.app",
  messagingSenderId: firebaseConfigData.messagingSenderId || "474961132774",
  appId: firebaseConfigData.appId || "1:474961132774:web:8499d78d96648b310a4f27",
};

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database with the specified Database ID
const databaseId = firebaseConfigData.firestoreDatabaseId || "(default)";
export const db = databaseId && databaseId !== "(default)"
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
};
