import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Check if we're not in production and use emulator
const useEmulator = process.env.NODE_ENV !== 'production' && process.env.USE_FIREBASE_EMULATORS === 'true';

// Initialize Firebase Admin
if (!getApps().length) {
  // If running locally, use service account credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {

      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      `
      {
        "type": "service_account",
        "project_id": "bepnhatram-250504",
        "private_key_id": "e7dbdb725af908841eeb3db0f13729bf53e1745e",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4r8EAh1JR25E3\nT7LW8LoKP+UqY1zDaA5dG0NPba6ht76bbjrw9pxmQAR0PA8Uqzbw1mWAUA9z3+AF\nc9j8JM/RRGUWNxXb92x8OYeodQu78KBhrS4ibPpNH9ZKUTx64sdLO38CeAbTS4pL\np8OQFmjhgVPLX+xMPUh/wvPTWCLnkWa4U16vF0GKwHLkzzaiD6AO21+mJO/gzae4\nH462mhkdo4AWjIO0C+aCKVEuvS4mTGZ6hKhwL/SP97PWICT29MRbI7diPRk8fJDJ\nZmvAgKG/H2QHwo3TCXdDti3xt4jsLOvHTqSnIAPAZ+m3k59bCxQVsfbREQ3IzJnJ\n4x79LWjTAgMBAAECggEAEDgjJ4Q61wSE4solhxnaBMdqvUe/oEuVo1ifFy0nPn2Q\nCD9sfrfxsUsi+QBDRMnqh8kUXenqCX+aQXBUmIQ1Ggg7JnHNAiXfCaPVxZYN40H1\nG87lM9HFQ5utqpYqzRH4daNyeomG8+x45z8C/jbxnAhLDxvL+UASi2HYHvHpEtP8\nHVNkQcffd2cU9O8wNSsWLV6Mmo3bPk00rvQIoc/JF+dL90WEtH6Q44h1NBY0f7X2\ncK9LMTeOodV8H7JwgaAXP4dpKn4oo1bPDnLsc3xxRwtu80kX2bNxKPyk9zoiMFuk\nS9iYeCui8lx7U2t3mst8lbm1LcuZJnjsnJdoYk//FQKBgQD4WEQsu1TMH0j7i5uV\n3fM18nDHMHqvoWLGzNRMuBkYwBTZ4q03z0qBtJSJYmTICl0RAJoPOvmhnxDOlj+U\ne+EZj2ICFdqUrGDX3oq9O0GGuEEQx8y9LxCgRn//bdscpS/Xewq7eNJKn9gdBcNI\noCbDuCLyzN7BDaUk5b7e3+lwJQKBgQC+YSYZJbnoXS/LUw6db748lqhKFStQ/LNy\ncq3R5CdV6avsHvILpI9Wbo7mEHghhqRm59Bn25NWMV6L4fqTXnjt/6glb0lb6LaU\nz6NDqcp4KrWVHSGN4utYt0ErkBxSMM0OoJpGgjV6Dkiw91gQ4tSBxbz3ijMxFYhU\nG/v/dDpHlwKBgQDf7BZsjuzCsGLKDPNYiivFtLhjoh69RbMetYmnM0fNvUQPwgeV\njt8LXJuh1IoypMWNkxFWMkLrq9UnsOnbJGeu+E3Su4m/DD615f8K6OcIZhKk4sKE\nwm8nVOoMki1DAt7EWDkxGJvklYPzh0KxtVW+m8VHT9p6D6ecQVt88kA10QKBgCzb\nkzCFtSJNIr/T2DO8aqS4Evsxtb0lbdrfrpkwGxyhLIM8X2fi5GtHLaCD7OppYT9m\nC7MNB9BdXZu0KWij7/aUMLhxWmWvlaXGrv94eF6MIbD65jcaar3CoDZ1hFbRbN+v\nc+p9L8CMsRARl8ySxeO2BeqFw74jBrZayavNZRYNAoGAOZc58qY78P84zNHe8RW4\nDZVWJmib8SaPT+5G7amSsXxXJF+zFCH9iokHnkCFgxUB8fKlcj/sMYP3n/v9g128\n7OomjYgdHwPOFRMONlJUd5AzeZlI+fmOdUVOTUfFfgkJhkpqMLDamRfelEQQoX+e\njheMKRX25V0ZuUfmwdiiP5I=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-fbsvc@bepnhatram-250504.iam.gserviceaccount.com",
        "client_id": "114046720836631249550",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bepnhatram-250504.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
      }

      `;

      const serviceAccount = JSON.parse(serviceAccountKey);
      
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bepnhatram-250504.firebasestorage.app",
      });
    } catch (error) {
      console.error('Error initializing firebase admin with service account:', error);
      
      // Fallback to application default credentials
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
      });
    }
  } else {
    // In production environments like Vercel, use application default credentials
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
    });
  }
}

// Initialize Firestore, Auth, and Storage
const adminDb = getFirestore();
const adminAuth = getAuth();
const adminStorage = getStorage();

// Configure emulator connections if needed
if (useEmulator) {
  const emulatorHost = process.env.FIREBASE_EMULATOR_HOST || 'localhost';
  adminDb.settings({
    host: `${emulatorHost}:8080`,
    ssl: false,
  });
}

export { adminDb, adminAuth, adminStorage };