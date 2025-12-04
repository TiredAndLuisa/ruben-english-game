// This script spawns a new cmd.exe process to execute the deploy script
// This avoids the broken PowerShell readline issue

const { spawn } = require('child_process');
const path = require('path');

const repoPath = path.resolve(__dirname, '..');
const deployScriptPath = path.join(__dirname, 'deploy.js');

console.log('🚀 Launching deployment in separate cmd.exe process...\n');

// Spawn a new cmd process that will execute the deploy script
const cmd = spawn('cmd.exe', ['/c', `node "${deployScriptPath}"`], {
  cwd: repoPath,
  stdio: 'inherit',
  shell: false,
  detached: false
});

cmd.on('close', (code) => {
  console.log(`\nProcess exited with code ${code}`);
  process.exit(code || 0);
});

cmd.on('error', (err) => {
  console.error('Failed to start deployment process:', err);
  process.exit(1);
});
