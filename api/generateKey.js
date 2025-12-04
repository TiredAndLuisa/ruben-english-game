const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const { initFirebase } = require('./_initFirebase');

module.exports = async function (req, res) {
  // protect generation with a secret header
  const secret = process.env.KEY_GEN_SECRET || '';
  // Accept multiple header names for compatibility with different admin pages
  const provided = req.headers['x-gen-secret'] || req.headers['x-key-gen-secret'] || req.headers['x-key-gen'] || req.query.secret || '';
  if(!secret || provided !== secret){ return res.status(403).json({ error: 'forbidden' }); }

  try{
    const db = initFirebase();
    const key = uuidv4().split('-').join('').slice(0,16).toUpperCase();
    const doc = db.collection('keys').doc(key);
    await doc.set({ key, createdAt: admin.firestore.FieldValue.serverTimestamp(), deviceId: null, redeemedAt: null });
    return res.status(200).json({ key });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
}
