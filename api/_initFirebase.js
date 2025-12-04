const admin = require('firebase-admin');
const fs = require('fs');

function tryParseServiceAccount(raw) {
  // Attempt plain JSON
  try { return JSON.parse(raw); } catch (e) {}

  // Attempt base64-decoded JSON
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (e) {}

  // Attempt to treat raw as a path to a JSON file (useful for local dev)
  try {
    if (fs.existsSync(raw)) {
      const txt = fs.readFileSync(raw, 'utf8');
      return JSON.parse(txt);
    }
  } catch (e) {}

  return null;
}

function initFirebase(){
  if(admin.apps && admin.apps.length>0) return admin.firestore();
  const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!svcRaw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var not set');

  const svc = tryParseServiceAccount(svcRaw);
  if(!svc) throw new Error('FIREBASE_SERVICE_ACCOUNT must be a valid JSON string, base64-encoded JSON, or path to a JSON file');

  admin.initializeApp({ credential: admin.credential.cert(svc), projectId: svc.project_id });
  return admin.firestore();
}

module.exports = { initFirebase };
