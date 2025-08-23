# Deploying to Netlify

## Option 1: Connect GitHub Repository (Recommended)

1. **Push to GitHub:**
   - Create a new repository on GitHub
   - Push this code to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Daily Selfie App"
   git branch -M main
   git remote add origin https://github.com/yourusername/daily-selfie-app.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to your Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Build settings should auto-detect:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Set Environment Variables:**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add these variables:
     - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
     - `VITE_GOOGLE_API_KEY`: Your Google API Key

4. **Update Google OAuth Settings:**
   - In Google Cloud Console, add your Netlify domain to "Authorized JavaScript origins"
   - Example: `https://your-site-name.netlify.app`

## Option 2: Manual Deploy

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to your Netlify dashboard
   - Drag and drop the `dist` folder to deploy
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables:**
   - Same as Option 1, step 3

## Important Notes:

- Make sure to update your Google OAuth settings with the new domain
- The `.env` file is ignored by git for security
- Environment variables must be set in Netlify's dashboard
- The app requires HTTPS (which Netlify provides automatically)

## Testing the Deployment:

1. Visit your deployed site
2. Test Google sign-in
3. Test camera access
4. Test photo capture and upload to Google Photos

If you encounter any issues, check:
- Environment variables are set correctly
- Google OAuth domain is authorized
- Camera permissions are granted
- Google Photos API is enabled