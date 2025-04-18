# Expense Tracker App

A mobile application built with React Native and Expo for tracking personal or business expenses.

## Features

- **Expense Management**: Add, edit, view, and delete expenses
- **Categorization**: Categorize expenses (Food, Travel, Stay, Transport, Other)
- **Receipt Attachment**: Attach receipts to expenses (images or PDFs)
- **Filtering & Search**: Filter expenses by category and search by title
- **Reports**: Generate expense reports for a selected date range
- **User Profile**: View and edit user profile information

## Tech Stack

- **React Native**: Mobile app framework
- **Expo**: Development platform for React Native
- **TypeScript**: Type-safe JavaScript
- **Expo Router**: Navigation and routing
- **AsyncStorage**: Local data persistence
- **Expo Image Picker**: For selecting images from camera or gallery
- **Expo Document Picker**: For selecting PDF files
- **Expo File System**: For file operations
- **Expo Sharing**: For sharing reports and receipts

## Project Structure

```
ExpenseTracker/
├── app/                    # Main application screens
│   ├── _layout.tsx         # Root layout with AppProvider
│   └── (tabs)/             # Tab-based navigation
│       ├── _layout.tsx     # Tab navigation configuration
│       ├── index.tsx       # Expenses screen (main tab)
│       ├── reports.tsx     # Reports screen
│       └── profile.tsx     # Profile screen
├── components/             # Reusable components
│   ├── expense/            # Expense-related components
│   │   ├── AddExpenseModal.tsx
│   │   ├── EditExpenseModal.tsx
│   │   ├── ViewExpenseModal.tsx
│   │   ├── ExpenseItem.tsx
│   │   └── CategoryChip.tsx
│   └── ...                 # Other UI components
├── context/                # Application state management
│   └── AppContext.tsx      # Context for expenses and user data
├── constants/              # App constants
│   └── Colors.ts           # Color definitions
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) - for building APK/AAB files
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ExpenseTracker.git
   cd ExpenseTracker
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npm start
   # or
   yarn start
   ```

4. Run on a device or simulator
   - Press `i` to run on iOS Simulator
   - Press `a` to run on Android Emulator
   - Scan the QR code with Expo Go app on your physical device

## Usage

### Adding an Expense

1. Tap the "+" button on the Expenses screen
2. Fill in the expense details (title, amount, date, category)
3. Optionally attach a receipt
4. Tap "Save Expense"

### Generating a Report

1. Navigate to the Reports tab
2. Select start and end dates using the calendar
3. Tap "Generate Excel Report"
4. The report will be shared as a CSV file

## Building and Publishing

This project includes scripts to help you build APK files and publish to the Google Play Store.

### Quick Commands

```bash
# Build an APK file for testing
npm run build:apk

# Build an AAB file for Play Store submission
npm run build:aab

# Generate a privacy policy
npm run generate:privacy-policy
```

### Documentation

For detailed instructions, see:

- [Quick Start Guide](./docs/quick-start.md) - Simple step-by-step instructions
- [Publishing Guide](./docs/publishing-guide.md) - Comprehensive publishing instructions

## Building and Publishing

### Building an APK for Android

To create an APK file that you can install directly on Android devices:

1. Install EAS CLI
   ```
   npm install -g eas-cli
   ```

2. Log in to your Expo account
   ```
   eas login
   ```

3. Configure the build
   Create an `eas.json` file in the root of your project with the following content:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "android": {
           "buildType": "app-bundle"
         }
       }
     }
   }
   ```

4. Build the APK
   ```
   eas build -p android --profile preview
   ```

5. Once the build is complete, you'll receive a link to download the APK file.

### Publishing to Google Play Store

To publish your app to the Google Play Store:

1. Create a Google Play Developer account
   - Visit [Google Play Console](https://play.google.com/console/signup)
   - Pay the one-time $25 registration fee

2. Prepare your app for submission
   - Update the `app.json` file with appropriate metadata
   - Ensure you have high-quality app icons and screenshots
   - Create a privacy policy document

3. Generate a signed AAB (Android App Bundle)
   ```
   eas build -p android --profile production
   ```

4. Create a new app in the Google Play Console
   - Go to "All apps" > "Create app"
   - Fill in the app details

5. Set up your store listing
   - Add app description, screenshots, feature graphic, etc.
   - Configure content rating
   - Set pricing and distribution

6. Upload your AAB file
   - Go to "Production" > "Create new release"
   - Upload the AAB file generated by EAS Build
   - Add release notes

7. Submit for review
   - Complete the content rating questionnaire
   - Fill out the pricing and distribution form
   - Review and roll out to production

The review process typically takes 1-3 days. Once approved, your app will be available on the Google Play Store.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by FontAwesome
- UI design inspired by Carbon Design System
