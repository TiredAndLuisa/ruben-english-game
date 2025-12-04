# Professor Ruben — Learn English (Kids) — Sound Version

Simple static project to help kids learn English, featuring a colorful interface, sound effects generated with the Web Audio API, and pronunciation via SpeechSynthesis.

## Structure
- `index.html` — main page
- `style.css` — styles
- `app.js` — game logic + sound engine

## Run locally
Open `index.html` directly in a browser or run a local static server to avoid `speechSynthesis`/AudioContext restrictions in some browsers.

Recommended with `npx`:

```powershell
npx http-server -c-1 . -p 8080
# then open http://localhost:8080
```

Or with Python (if installed):

```powershell
python -m http.server 8080
# then open http://localhost:8080
```

## Deploy to Vercel
1. Create a GitHub repository with these files.
2. Connect the repo to Vercel (https://vercel.com) and deploy as a static project.

### Quick steps to create the repo and deploy (Windows PowerShell)

```powershell
cd "c:\Users\migue\OneDrive\Documents\Nova pasta\ruben-english-game-sound"
git init
git add .
git commit -m "Initial: Ruben English Game with sounds and stickers"
# create the GitHub repo via CLI (gh) or the website. With gh:
gh repo create your-username/ruben-english-game --public --source=. --remote=origin
git push -u origin main
```

After pushing to GitHub, on Vercel:

If you prefer, share the repo link or a token with access (optional) and I can automate the deploy for you.

## Activation keys (server setup)

This project includes serverless endpoints to manage activation keys using Firebase Firestore. A key can be generated (server-side) and will bind to the first device that redeems it. To enable this feature you must:

1. Create a Firebase project and a service account (JSON) with access to Firestore. Save the JSON.
2. In your Vercel project, set the following Environment Variables:
	- `KEY_GEN_SECRET` — a secret string that protects key generation (the API accepts `x-gen-secret` or `x-key-gen-secret` headers).

Endpoints (deployed under `/api`):

Client integration:

Notes:

## Possible improvements

## Privacy & compatibility

Have fun! 🎉



This project includes an `admin/` folder that is a small static site used to call the `/api/generateKey` endpoint. You asked for the key to be generated from "a site de fora" — that means hosting `admin/` separately from the main game site. Recommended options:

- Netlify (quick, free): create a new site from the `admin/` folder and set a build command of "" (static) or just drag-and-drop. Keep the admin site private — or use Netlify's password-protect addon or use a private repo.
- GitHub Pages (if you will keep the secret client-side during use, not recommended) — better to use Netlify or a password-protected host.
- Vercel (separate project): you may also host `admin/` on a different Vercel project and keep it private by adding a simple authentication layer.

When deploying the admin site, point the `API URL` field to the public URL of the Vercel-deployed `/api/generateKey` endpoint and use the `KEY_GEN_SECRET` you set in Vercel Dashboard.

Example Netlify quick deploy (drag & drop):

1. Zip the `admin/` folder or drag it to Netlify Sites -> New site from Git / Deploys -> Deploy site (drag & drop).
2. Once deployed, open the admin site, paste the `API URL` (e.g. `https://your-game.vercel.app/api/generateKey`) and the admin secret.

Automated deploy helper
-----------------------

If you want the process automated locally, there are helper scripts in `scripts/`.

Prepare (PowerShell session):

```powershell
# create fresh tokens in Vercel and Netlify, then set them for this session
$env:VERCEL_TOKEN = 'your_vercel_token'
$env:VERCEL_PROJECT_ID = 'your_vercel_project_id'
$env:NETLIFY_AUTH_TOKEN = 'your_netlify_token'
# provide the path to your Firebase service account JSON, or set FIREBASE_SERVICE_ACCOUNT with the JSON text
$env:FIREBASE_SERVICE_ACCOUNT_FILE = 'C:\path\to\service-account.json'
$env:KEY_GEN_SECRET = 'a_strong_secret_here'

# run the helper (from repo root)
node scripts\vercel_set_env.js
npx netlify deploy --dir=admin/simple --prod --message "admin/simple deploy"
```

Or run the convenience wrapper (PowerShell):

```powershell
.\scripts\run_all.ps1
```

Notes:
- `vercel_set_env.js` uses the Vercel API and requires `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` to set env vars.
- Netlify CLI uses `NETLIFY_AUTH_TOKEN`; if you prefer a UI flow, drag & drop `admin/simple` in Netlify Dashboard.
- After env vars are set, trigger a Vercel redeploy in the Dashboard if the API doesn't auto-deploy.

