# Daily Selfie App

A beautiful web application for taking daily selfies and automatically syncing them to Google Photos.

## Features

- 📸 Daily webcam selfie capture
- 🔐 Google OAuth authentication
- ☁️ Automatic Google Photos sync to "selfies" album
- 📊 Progress tracking with streaks and stats
- 📱 Responsive design for all devices
- 🎨 Beautiful, modern interface

## Setup Instructions

### 1. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Photos Library API
4. Create API Key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the API key for later use
5. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins"
   - For local development, add: `http://localhost:5173`

### 2. Environment Variables

1. Copy `.env.example` to `.env`
2. Replace `your_google_client_id_here` with your actual Google OAuth client ID
3. Replace `your_google_api_key_here` with your actual Google API key

### 3. Google Photos API Setup

1. In Google Cloud Console, enable the "Photos Library API"
2. Make sure your OAuth consent screen includes the following scopes:
   - `https://www.googleapis.com/auth/photoslibrary.appendonly`
   - `https://www.googleapis.com/auth/photoslibrary.sharing`
   - `openid`
   - `email`
   - `profile`

### 4. Running the App

```bash
npm install
npm run dev
```

## Important Notes

- The app now includes full Google Photos Library API integration
- Photos are automatically uploaded to a "Daily Selfies" album in your Google Photos
- Camera permissions are required for the app to function
- Selfies are stored locally and can be uploaded to Google Photos with one click

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for development and building
- Google Identity Services for authentication
- WebRTC for camera access
- Lucide React for icons

## Security & Privacy

- All authentication is handled by Google OAuth
- Photos are stored in your personal Google Photos account
- No selfie data is stored on external servers
- Camera access is only used for taking selfies