import { doc, getDoc, getDocs, updateDoc, setDoc, deleteDoc, DocumentReference, CollectionReference, Query } from "firebase/firestore";
import { auth } from "../firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Detailed Wrap:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Relational DB verification checker as specified in dynamic boot validations
export async function validateConnection() {
  try {
    const testDoc = doc(dbInstance(), "test", "connection");
    // Attempt load without causing errors in main flow
    await getDoc(testDoc);
  } catch (error: any) {
    if (error?.message && error.message.includes("offline")) {
      console.warn("Please verify your Firebase connectivity config. Running in offline environment.");
    }
  }
}

// Small helper to dynamically import / export db reference
import { db } from "../firebase";
export function dbInstance() {
  return db;
}
