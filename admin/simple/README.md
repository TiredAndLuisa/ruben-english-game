# Simple Key Generator (admin/simple)

This is a tiny static admin page you can host anywhere (Netlify, Vercel, GitHub Pages) to generate keys from your production `generateKey` endpoint.

Usage:

- Open `index.html` in a browser (or deploy the `admin/simple` folder as a static site).
- Enter your project's API base URL (example: `https://ruben-english-game-sound-xxxx.vercel.app`).
- Enter the `KEY_GEN_SECRET` (value you set in the hosting env).
- Click `Generate Key`. The created key will appear and you can copy it.

Security:

- Keep the `KEY_GEN_SECRET` private. Do not expose this page publicly unless you control access (password protection, IP restriction, or host privately).
- If you prefer, host this page in the same project and restrict access via your hosting provider's protection features.

Hosting example (Netlify):

1. Drag & drop the `admin/simple` folder into Netlify deploy UI or connect a repo and set build to "None".
2. Visit the deployed page, set API base URL and secret, generate keys.
