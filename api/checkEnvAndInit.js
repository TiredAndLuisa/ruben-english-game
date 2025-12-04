#!/usr/bin/env node
const { initFirebase } = require('./_initFirebase');

(async () => {
  try {
    const db = initFirebase();
    console.log('Firebase initialized. Attempting a lightweight Firestore request...');
    const snap = await db.collection('keys').limit(1).get();
    console.log('Firestore reachable. Sample documents:', snap.size);
    console.log('Initialization OK');
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err && err.message ? err.message : err);
    console.error('Make sure `FIREBASE_SERVICE_ACCOUNT` env var is set to the service account JSON (or base64 of it, or a path to a file).');
    process.exit(2);
  }
})();
