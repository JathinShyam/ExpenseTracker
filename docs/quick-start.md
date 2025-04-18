# ExpenseTracker - Quick Start Guide

This guide provides simple step-by-step instructions for building and publishing your ExpenseTracker app.

## Building an APK (for testing)

To create an APK file that you can install directly on Android devices:

1. Open your terminal in the project directory
2. Run the build script:
   ```
   npm run build:apk
   ```
3. Follow the prompts to log in to your Expo account if needed
4. Wait for the build to complete (this may take 10-15 minutes)
5. Download the APK from the link provided in the terminal or in your email

## Installing the APK on an Android Device

1. Transfer the APK file to your Android device
2. On your Android device, navigate to the APK file
3. Tap the file to install it
4. If prompted, enable "Install from unknown sources" in your device settings
5. Follow the on-screen instructions to complete the installation

## Publishing to Google Play Store

### One-Time Setup

1. Create a Google Play Developer account:
   - Visit [Google Play Console](https://play.google.com/console/signup)
   - Pay the one-time $25 registration fee
   - Complete the account setup process

2. Generate a privacy policy:
   ```
   npm run generate:privacy-policy
   ```
   - Host the generated HTML file on a web server or GitHub Pages
   - Note the URL where your privacy policy is hosted

### Building for Production

1. Build an Android App Bundle (AAB) for the Play Store:
   ```
   npm run build:aab
   ```
2. Wait for the build to complete
3. Download the AAB file from the link provided

### Submitting to the Play Store

1. Log in to the [Google Play Console](https://play.google.com/console)
2. Create a new app:
   - Click "Create app"
   - Fill in the app details
   - Click "Create app" to confirm

3. Set up your store listing:
   - Add app description, screenshots, and feature graphic
   - Enter your privacy policy URL
   - Save your changes

4. Upload your AAB file:
   - Go to "Production" > "Create new release"
   - Upload the AAB file you downloaded
   - Add release notes
   - Save and review the release

5. Complete the content rating questionnaire:
   - Go to "Content rating"
   - Answer all questions truthfully
   - Submit the questionnaire

6. Set up pricing and distribution:
   - Go to "Pricing & distribution"
   - Choose whether your app is free or paid
   - Select countries for distribution
   - Save your changes

7. Submit for review:
   - Go back to your release
   - Click "Start rollout to Production"
   - Confirm your submission

## Updating Your App

To update your app in the future:

1. Make your changes to the code
2. Update the version number in app.json:
   ```json
   {
     "expo": {
       "version": "1.0.1",  // Increment this
       "android": {
         "versionCode": 2   // Increment this
       }
     }
   }
   ```
3. Build a new AAB:
   ```
   npm run build:aab
   ```
4. Create a new release in the Play Console
5. Upload the new AAB
6. Add release notes
7. Submit for review

## Need More Help?

For more detailed instructions, see:
- [Full Publishing Guide](./publishing-guide.md)
- [Expo Documentation](https://docs.expo.dev/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)