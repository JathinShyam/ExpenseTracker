#!/usr/bin/env node

/**
 * Script to build an APK file for the ExpenseTracker app
 * This script simplifies the process of building an APK using EAS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Print a styled message
function printMessage(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Check if EAS CLI is installed
function checkEasCli() {
  try {
    execSync('eas --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function buildApk() {
  printMessage('\n🚀 ExpenseTracker APK Builder 🚀\n', colors.bright + colors.blue);
  
  // Check if EAS CLI is installed
  if (!checkEasCli()) {
    printMessage('❌ EAS CLI is not installed. Installing it now...', colors.yellow);
    try {
      execSync('npm install -g eas-cli', { stdio: 'inherit' });
      printMessage('✅ EAS CLI installed successfully!', colors.green);
    } catch (error) {
      printMessage('❌ Failed to install EAS CLI. Please install it manually with: npm install -g eas-cli', colors.red);
      process.exit(1);
    }
  }
  
  // Check if user is logged in to Expo
  printMessage('🔑 Checking Expo login status...', colors.blue);
  try {
    execSync('eas whoami', { stdio: 'ignore' });
    printMessage('✅ You are logged in to Expo', colors.green);
  } catch (error) {
    printMessage('❌ You are not logged in to Expo. Please log in:', colors.yellow);
    try {
      execSync('eas login', { stdio: 'inherit' });
    } catch (error) {
      printMessage('❌ Failed to log in to Expo. Please try again later.', colors.red);
      process.exit(1);
    }
  }
  
  // Check if eas.json exists
  const easJsonPath = path.join(process.cwd(), 'eas.json');
  if (!fs.existsSync(easJsonPath)) {
    printMessage('❌ eas.json not found. Please make sure you are in the project root directory.', colors.red);
    process.exit(1);
  }
  
  // Start the build process
  printMessage('\n🔨 Starting APK build process...', colors.blue);
  printMessage('⏳ This may take several minutes. Please be patient.', colors.yellow);
  
  try {
    execSync('eas build -p android --profile preview', { stdio: 'inherit' });
    printMessage('\n✅ Build process initiated successfully!', colors.green);
    printMessage('📱 You will receive an email with the download link once the build is complete.', colors.green);
    printMessage('🔍 You can also check the build status on your Expo dashboard.', colors.blue);
  } catch (error) {
    printMessage('\n❌ Build process failed. Please check the error message above.', colors.red);
    process.exit(1);
  }
}

// Run the main function
buildApk().catch(error => {
  printMessage(`\n❌ An unexpected error occurred: ${error.message}`, colors.red);
  process.exit(1);
});