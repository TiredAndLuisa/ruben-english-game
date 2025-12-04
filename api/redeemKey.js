const admin = require('firebase-admin');
const { initFirebase } = require('./_initFirebase');

module.exports = async function (req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const { key, deviceId } = req.body || {};
  if(!key || !deviceId) return res.status(400).json({ error: 'missing key or deviceId' });
  try{
    const db = initFirebase();
    const docRef = db.collection('keys').doc(String(key));
    await db.runTransaction(async (tx)=>{
      const snap = await tx.get(docRef);
      if(!snap.exists) throw new Error('invalid');
      const data = snap.data();
      if(!data.deviceId){
        // bind to this device
        tx.update(docRef, { deviceId, redeemedAt: admin.firestore.FieldValue.serverTimestamp() });
        return; // success
      }
      if(data.deviceId !== deviceId){ throw new Error('taken'); }
      // already bound to this device -> ok
    });
    return res.status(200).json({ ok: true });
  }catch(e){
    if(e.message === 'invalid') return res.status(404).json({ error: 'invalid' });
    if(e.message === 'taken') return res.status(409).json({ error: 'taken' });
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
