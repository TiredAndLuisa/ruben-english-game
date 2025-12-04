Setup and test environment variables for serverless Firestore functions
===============================================================

This project requires two environment variables in the hosting environment (production):

- `FIREBASE_SERVICE_ACCOUNT` : the full Firebase service-account JSON as a string. Accepts:
  - the raw JSON string
  - a base64-encoded JSON string
  - a local file path (useful for local testing)

- `KEY_GEN_SECRET` : a secret string used by the admin site to call `/api/generateKey`.

Recommended setup (Dashboard - easiest):

1. Open your hosting provider dashboard (e.g. Vercel) -> Project -> Settings -> Environment Variables.
2. Add `FIREBASE_SERVICE_ACCOUNT` and paste the entire service-account JSON (multiline). Save.
3. Add `KEY_GEN_SECRET` and set a strong random value. Save.
4. Trigger a new deployment (or redeploy) so functions read the new variables.

Quick local check (PowerShell):

1. From your project root, set the env var locally and run the check script. For PowerShell (temporary for the session):

```powershell
$env:FIREBASE_SERVICE_ACCOUNT = Get-Content -Raw .\path\to\service-account.json
$env:KEY_GEN_SECRET = 'replace-with-your-secret'
node .\api\checkEnvAndInit.js
```

If initialization succeeds, you'll see "Initialization OK" and a count of sample documents.

If you prefer automation or cannot paste multiline values into the Dashboard UI, use your hosting provider's API or CLI to set the environment variables (follow the provider docs). The Dashboard method is recommended to avoid CLI quoting/encoding issues on Windows.

If you want me to add the variables programmatically, provide a management token (only if you trust me with it) and I can set them and run the tests for you.
