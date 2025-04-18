#!/usr/bin/env node

/**
 * Script to generate a basic privacy policy for the ExpenseTracker app
 * This creates a simple HTML file that can be hosted online
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Print a styled message
function printMessage(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Ask a question and get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function generatePrivacyPolicy() {
  printMessage('\n📝 ExpenseTracker Privacy Policy Generator 📝\n', colors.bright + colors.blue);
  printMessage('This script will help you create a basic privacy policy for your app.\n', colors.blue);
  
  // Get user input
  const companyName = await askQuestion('Enter your company/developer name: ');
  const contactEmail = await askQuestion('Enter contact email address: ');
  const appName = await askQuestion('Enter app name (default: ExpenseTracker): ') || 'ExpenseTracker';
  const effectiveDate = await askQuestion('Enter effective date (default: today): ') || new Date().toISOString().split('T')[0];
  
  // Generate the privacy policy HTML
  const privacyPolicyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Privacy Policy</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2 {
      color: #0f62fe;
    }
    h1 {
      border-bottom: 2px solid #0f62fe;
      padding-bottom: 10px;
    }
    h2 {
      margin-top: 30px;
    }
    p {
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 50px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>${appName} Privacy Policy</h1>
  
  <p><strong>Effective Date:</strong> ${effectiveDate}</p>
  
  <p>
    ${companyName} ("we," "our," or "us") is committed to protecting your privacy. 
    This Privacy Policy explains how your personal information is collected, used, and disclosed by ${companyName}.
  </p>
  
  <h2>Information We Collect</h2>
  
  <p>
    <strong>Personal Information You Provide:</strong> When you use ${appName}, we may collect information that you provide directly, such as:
  </p>
  <ul>
    <li>Profile information (name, email address, department, employee ID)</li>
    <li>Expense data (titles, amounts, dates, categories)</li>
    <li>Images or documents you upload as receipts</li>
  </ul>
  
  <h2>How We Use Your Information</h2>
  
  <p>We use the information we collect for the following purposes:</p>
  <ul>
    <li>To provide, maintain, and improve ${appName}</li>
    <li>To store your expense data and generate reports</li>
    <li>To respond to your comments, questions, and requests</li>
  </ul>
  
  <h2>Data Storage</h2>
  
  <p>
    ${appName} stores all your data locally on your device. We do not transmit or store your expense data on our servers.
    Your data remains on your device unless you explicitly choose to export or share it.
  </p>
  
  <h2>Camera and Storage Permissions</h2>
  
  <p>
    ${appName} requests access to your device's camera and storage to allow you to take photos of receipts and save them.
    These permissions are only used for the functionality of the app and not for any other purpose.
  </p>
  
  <h2>Data Sharing</h2>
  
  <p>
    We do not sell, trade, or otherwise transfer your personal information to outside parties.
    When you generate and share reports, you control who receives that information.
  </p>
  
  <h2>Your Rights</h2>
  
  <p>You have the right to:</p>
  <ul>
    <li>Access, update, or delete your personal information within the app</li>
    <li>Export your data in a portable format (CSV)</li>
    <li>Uninstall the app at any time, which will remove all app data from your device</li>
  </ul>
  
  <h2>Changes to This Privacy Policy</h2>
  
  <p>
    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
    and updating the "Effective Date" at the top.
  </p>
  
  <h2>Contact Us</h2>
  
  <p>
    If you have any questions about this Privacy Policy, please contact us at:
    <a href="mailto:${contactEmail}">${contactEmail}</a>
  </p>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
  </div>
</body>
</html>
  `;
  
  // Create docs directory if it doesn't exist
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }
  
  // Write the privacy policy to a file
  const filePath = path.join(docsDir, 'privacy-policy.html');
  fs.writeFileSync(filePath, privacyPolicyHtml);
  
  printMessage(`\n✅ Privacy policy generated successfully!`, colors.green);
  printMessage(`📄 File saved to: ${filePath}`, colors.blue);
  printMessage(`\n📋 Next steps:`, colors.bright);
  printMessage(`1. Host this HTML file on a web server or GitHub Pages`, colors.reset);
  printMessage(`2. Add the URL to your Google Play Store listing`, colors.reset);
  printMessage(`3. Update the policy as needed to comply with relevant laws`, colors.reset);
  
  rl.close();
}

// Run the main function
generatePrivacyPolicy().catch(error => {
  printMessage(`\n❌ An unexpected error occurred: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});