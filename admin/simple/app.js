const $ = sel => document.querySelector(sel);
const apiUrlInput = $('#apiUrl');
const secretInput = $('#secret');
const genBtn = $('#genBtn');
const result = $('#result');
const keyText = $('#keyText');
const copyBtn = $('#copyBtn');
const newBtn = $('#newBtn');

function showError(msg){
  alert(msg);
}

async function generateKey(){
  const apiBase = (apiUrlInput.value || '').trim();
  const secret = (secretInput.value || '').trim();
  if(!apiBase) return showError('Please enter the API base URL');
  if(!secret) return showError('Please enter the admin secret');

  genBtn.disabled = true;
  genBtn.textContent = 'Generating...';

  try{
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/generateKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-key-gen-secret': secret
      },
      body: JSON.stringify({ note: 'generated-via-simple-admin' })
    });
    if(!res.ok){
      const txt = await res.text();
      throw new Error(`Server returned ${res.status}: ${txt}`);
    }
    const data = await res.json();
    keyText.textContent = data.key || JSON.stringify(data, null, 2);
    result.classList.remove('hidden');
    genBtn.textContent = 'Generated';
  }catch(err){
    showError(err.message || err);
    genBtn.textContent = 'Generate Key';
  }finally{
    genBtn.disabled = false;
  }
}

genBtn.addEventListener('click', generateKey);
copyBtn.addEventListener('click', ()=>{
  const t = keyText.textContent.trim();
  if(!t) return;
  navigator.clipboard.writeText(t).then(()=>{
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>copyBtn.textContent = 'Copy', 1500);
  }).catch(()=>alert('Copy failed — please select and copy manually'));
});

newBtn.addEventListener('click', ()=>{
  result.classList.add('hidden');
  keyText.textContent = '';
  genBtn.textContent = 'Generate Key';
});

// helpful defaults (you can remove)
if(!apiUrlInput.value) apiUrlInput.value = window.location.origin.replace(/\/admin\/simple$/,'') || '';
