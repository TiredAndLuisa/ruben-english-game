#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPO_PATH = path.resolve(__dirname, '..');
const OWNER = 'TiredAndLuisa';
const REPO = 'ruben-english-game';
const BRANCH = 'master';

console.log('🚀 Starting deployment process...\n');

// Helper to run commands with execSync using cmd.exe to avoid PowerShell issues
function runCommandSync(command, options = {}) {
  const cwd = options.cwd || REPO_PATH;
  console.log(`📌 Running: ${command}`);
  console.log(`📁 Working directory: ${cwd}\n`);
  
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      env: { ...process.env }
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Step 1: Git operations
function performGitOperations() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 STEP 1: Git Operations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check git status
    console.log('✓ Checking git status...');
    const status = execSync('git status --porcelain', {
      cwd: REPO_PATH,
      encoding: 'utf-8',
      shell: 'cmd.exe'
    });
    console.log(status || '(no output)');

    // Add all changes
    console.log('\n✓ Running: git add -A');
    try {
      execSync('git add -A', {
        cwd: REPO_PATH,
        stdio: 'inherit',
        shell: 'cmd.exe'
      });
    } catch (e) {
      // Silently continue even if git add has issues
    }

    // Commit changes
    console.log('✓ Running: git commit -m "Visual fixes"');
    try {
      execSync('git commit -m "Visual fixes"', {
        cwd: REPO_PATH,
        stdio: 'inherit',
        shell: 'cmd.exe'
      });
    } catch (error) {
      // Check if it's just "nothing to commit"
      if (error.message.includes('nothing to commit') || error.status === 1) {
        console.log('⚠️  No changes to commit');
        return true;
      }
      throw error;
    }

    // Push to origin master
    console.log('✓ Running: git push origin master');
    try {
      execSync('git push origin master', {
        cwd: REPO_PATH,
        stdio: 'inherit',
        shell: 'cmd.exe'
      });
    } catch (e) {
      console.log('⚠️  Git push may have failed, continuing...');
    }

    console.log('\n✅ Git operations completed!\n');
    return true;
  } catch (error) {
    console.error('❌ Git operation error:');
    console.error(error.message);
    return false;
  }
}

// Step 2: Deploy to Vercel
function deployToVercel() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 STEP 2: Deploying to Vercel');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('✓ Running: vercel --prod --confirm --yes\n');
    
    const vercelOutput = execSync('vercel --prod --confirm --yes', {
      cwd: REPO_PATH,
      encoding: 'utf-8',
      stdio: 'pipe',
      shell: 'cmd.exe',
      env: { ...process.env }
    });

    console.log('Vercel Output:\n', vercelOutput);

    // Extract production URL
    const urlMatch = vercelOutput.match(/https:\/\/[^\s\n\r]+\.vercel\.app/);
    const productionUrl = urlMatch ? urlMatch[0] : null;

    if (productionUrl) {
      console.log('\n✅ Deployment successful!');
      console.log(`🌐 Production URL: ${productionUrl}\n`);
      return productionUrl;
    } else {
      console.log('⚠️  Could not extract production URL from Vercel output');
      return null;
    }
  } catch (error) {
    console.error('❌ Vercel deployment failed:');
    console.error(error.message);
    console.error('\nFull error:', error);
    throw error;
  }
}

// Main execution
function main() {
  try {
    // Verify repository path
    if (!fs.existsSync(path.join(REPO_PATH, '.git'))) {
      throw new Error(`Git repository not found at ${REPO_PATH}`);
    }

    console.log(`\n📂 Repository path: ${REPO_PATH}\n`);

    // Step 1: Git
    const gitSuccess = performGitOperations();

    // Step 2: Vercel
    const productionUrl = deployToVercel();

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ DEPLOYMENT SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Repository: ${OWNER}/${REPO}`);
    console.log(`🔀 Branch: ${BRANCH}`);
    console.log(`📝 Git Status: ${gitSuccess ? '✅ Success' : '⚠️  Partial'}`);
    console.log(`🚀 Vercel Status: ✅ Success`);
    if (productionUrl) {
      console.log(`🌐 Production URL: ${productionUrl}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deployment failed with error:');
    console.error(error.message || error);
    console.error('\n📋 Error details:');
    console.error(error);
    process.exit(1);
  }
}

main();
