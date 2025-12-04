<#
Run this script locally to deploy the `admin/simple` folder to Netlify and set Vercel env vars.

Prerequisites (run locally in PowerShell):
- Node.js installed
- `npm i -g netlify-cli` (for Netlify deploy) or use Netlify UI drag-and-drop
- Set the following environment variables in your PowerShell session BEFORE running this script:
  $env:NETLIFY_AUTH_TOKEN = 'your_netlify_token'
  $env:VERCEL_TOKEN = 'your_vercel_token'
  $env:VERCEL_PROJECT_ID = 'your_vercel_project_id'
  $env:FIREBASE_SERVICE_ACCOUNT_FILE = 'C:\path\to\service-account.json'  # OR set FIREBASE_SERVICE_ACCOUNT directly
  $env:KEY_GEN_SECRET = 'a_strong_secret_value'

Usage:
  Open PowerShell, export the env vars above (only for your session), then run:
    node scripts\vercel_set_env.js
    npx netlify deploy --dir=admin/simple --prod --message "admin/simple deploy"

Notes:
- The `vercel_set_env.js` script will call the Vercel API and create encrypted env vars for the given project.
- Netlify CLI uses $env:NETLIFY_AUTH_TOKEN to authenticate; the deploy may prompt if no site exists. If you prefer, deploy `admin/simple` via Netlify Dashboard (drag & drop) instead.
- Do not paste tokens into any public place. Revoke tokens after use if desired.
#>

if(-not (Get-Command node -ErrorAction SilentlyContinue)){
  Write-Error 'Node.js is required. Install Node.js and try again.'; exit 1
}

if(-not $env:VERCEL_TOKEN){ Write-Host 'VERCEL_TOKEN not set. Please set $env:VERCEL_TOKEN and re-run.'; exit 1 }
if(-not $env:VERCEL_PROJECT_ID){ Write-Host 'VERCEL_PROJECT_ID not set. Please set $env:VERCEL_PROJECT_ID and re-run.'; exit 1 }
if(-not ($env:FIREBASE_SERVICE_ACCOUNT -or $env:FIREBASE_SERVICE_ACCOUNT_FILE)){ Write-Host 'Provide FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_FILE in the session and re-run.'; exit 1 }
if(-not $env:KEY_GEN_SECRET){ Write-Host 'Provide KEY_GEN_SECRET in the session and re-run.'; exit 1 }

Write-Host 'Setting Vercel environment variables (using VERCEL_TOKEN and VERCEL_PROJECT_ID)...'
node scripts\vercel_set_env.js
if($LASTEXITCODE -ne 0){ Write-Error 'Failed to set Vercel env vars. See output above.'; exit 1 }

Write-Host 'Deploying admin/simple to Netlify using Netlify CLI...'
if(-not (Get-Command netlify -ErrorAction SilentlyContinue)){
  Write-Host 'Netlify CLI not found. Installing netlify-cli globally (requires npm).'
  npm i -g netlify-cli
}

# Deploy (non-interactive if NETLIFY_AUTH_TOKEN is set)
npx netlify deploy --dir=admin/simple --prod --message "admin/simple deploy"
if($LASTEXITCODE -ne 0){ Write-Error 'Netlify deploy failed or was interactive. Consider deploying via Netlify Dashboard (drag & drop admin/simple).' ; exit 1 }

Write-Host 'Done. Admin site deployed and Vercel env vars set. Trigger a Vercel redeploy in the Dashboard if needed.'
