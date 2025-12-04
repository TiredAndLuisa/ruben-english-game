const admin = require('firebase-admin');

function initFirebase(){
  if(admin.apps && admin.apps.length>0) return admin.firestore();
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!svcJson) throw new Error('FIREBASE_SERVICE_ACCOUNT env var not set');
  let svc = null;
  try{ svc = JSON.parse(svcJson); }catch(e){ throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid JSON string'); }
  admin.initializeApp({ credential: admin.credential.cert(svc), projectId: svc.project_id });
  return admin.firestore();
}

module.exports = { initFirebase };
