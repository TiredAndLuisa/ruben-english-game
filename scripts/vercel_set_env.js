const fetch = require('node-fetch');
const fs = require('fs');

async function putEnv(token, projectId, key, value){
  const url = `https://api.vercel.com/v9/projects/${projectId}/env`;
  const body = { key, value, target: ['production'], type: 'encrypted' };
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if(!res.ok){
    const txt = await res.text();
    throw new Error(`Failed to set env ${key}: ${res.status} ${txt}`);
  }
  return res.json();
}

async function main(){
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if(!token) throw new Error('VERCEL_TOKEN not set in env');
  if(!projectId) throw new Error('VERCEL_PROJECT_ID not set in env');

  let svc = process.env.FIREBASE_SERVICE_ACCOUNT || null;
  if(!svc && process.env.FIREBASE_SERVICE_ACCOUNT_FILE){
    svc = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_FILE, 'utf8');
  }
  if(!svc) throw new Error('Provide FIREBASE_SERVICE_ACCOUNT (or FIREBASE_SERVICE_ACCOUNT_FILE) in env');

  const keyGen = process.env.KEY_GEN_SECRET;
  if(!keyGen) throw new Error('Provide KEY_GEN_SECRET in env');

  console.log('Setting Vercel env: KEY_GEN_SECRET');
  await putEnv(token, projectId, 'KEY_GEN_SECRET', keyGen);
  console.log('Setting Vercel env: FIREBASE_SERVICE_ACCOUNT (may be large)');
  await putEnv(token, projectId, 'FIREBASE_SERVICE_ACCOUNT', svc);
  console.log('All done. Trigger a redeploy in Vercel dashboard or use `vercel --prod` locally.');
}

main().catch(err=>{ console.error(err && err.message ? err.message : err); process.exit(1); });
