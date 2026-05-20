import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Boot strap the client-side Google Firebase Services
const app = initializeApp(firebaseConfig);

// Initialize Firestore specifying databaseId targeting our secure project database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Google Firebase Auth
export const auth = getAuth();
