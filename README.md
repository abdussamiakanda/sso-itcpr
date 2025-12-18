# ITCPR SSO Portal - React App

A Single Sign-On (SSO) portal application built with React and Firebase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (if it exists) or create a `.env` file
   - Add your Firebase configuration values (all variables must be prefixed with `VITE_` for Vite to expose them)

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

The following environment variables are **required** (all must be prefixed with `VITE_`):

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase authentication domain
- `VITE_FIREBASE_DATABASE_URL` - Firebase database URL
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional)
- `VITE_API_BASE_URL` - **Required** Base URL for the SSO API (no fallback, must be set in .env)
- `VITE_API_SSO_ENDPOINT` - **Required** SSO endpoint path (e.g., `/auth/sso`)

**Note:** All API URLs and endpoints must be configured in the `.env` file. There are no hardcoded fallback URLs or endpoint paths in the code.

## Project Structure

```
sso-itcpr/
├── src/
│   ├── components/
│   │   ├── Login.jsx       # Login component
│   │   ├── Dashboard.jsx   # Dashboard with app grid
│   │   └── Loading.jsx     # Loading spinner component
│   ├── App.jsx             # Main app component
│   ├── App.css             # Application styles
│   ├── firebase-config.js  # Firebase configuration
│   └── main.jsx            # React entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── .env                    # Environment variables (not committed)
```

## Features

- Firebase Authentication
- SSO token generation
- Popup mode for embedded authentication
- Responsive design
- Multiple application integration

## Development

The app uses Vite as the build tool. Hot module replacement (HMR) is enabled in development mode.

## Production Build

The production build will be output to the `dist/` directory. You can preview it with:

```bash
npm run preview
```

