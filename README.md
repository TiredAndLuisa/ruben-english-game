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
- Log in at https://vercel.com
- Click "New Project" → select the `ruben-english-game` repo → Deploy

If you prefer, share the repo link or a token with access (optional) and I can automate the deploy for you.

## Activation keys (server setup)

This project includes serverless endpoints to manage activation keys using Firebase Firestore. A key can be generated (server-side) and will bind to the first device that redeems it. To enable this feature you must:

1. Create a Firebase project and a service account (JSON) with access to Firestore. Save the JSON.
2. In your Vercel project, set the following Environment Variables:
	- `FIREBASE_SERVICE_ACCOUNT` — the full service account JSON as a single-line string (quote/escape as needed).
	- `KEY_GEN_SECRET` — a secret string that protects key generation (used in the `x-gen-secret` header).

Endpoints (deployed under `/api`):
- `POST /api/generateKey` — Protected by `x-gen-secret` header (value = `KEY_GEN_SECRET`). Returns `{ key }`.
- `POST /api/redeemKey` — Body: `{ key, deviceId }`. Binds the `key` to `deviceId` if unused, or validates if already bound.

Client integration:
- The site will show a small activation modal the first time it is used. Paste a valid key and click Activate. The client will send the local device id and the key to `/api/redeemKey`.

Notes:
- You need to set env vars and enable Firestore for these endpoints to work. Without `FIREBASE_SERVICE_ACCOUNT` the endpoints will return errors.
- This system binds the key to the first device id redeemed. The device id is stored in the browser `localStorage` under `ruben_device_id` — it is not foolproof but reasonable for simple single-device binding.

## Possible improvements
- Replace synthesized sounds with recorded tracks (`.mp3`/`.ogg`) — ensure files are public-domain or properly licensed.
- Add images and animations for each item.
- Expand progress and rewards (stickers, badges).
- Add multi-language support.

## Privacy & compatibility
- SpeechSynthesis runs locally in the browser — no text is sent to external servers.
- Tested in modern browsers (Chrome, Edge, Firefox). Safari may have different autoplay/AudioContext behavior.

Have fun! 🎉
