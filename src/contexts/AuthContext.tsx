import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        // First, check if we're returning from OAuth flow
        const hash = window.location.hash;
        if (hash.includes('access_token') && hash.includes('state=auth_callback')) {
          await handleOAuthCallback();
          return;
        }

        // Check if environment variables are available
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        
        if (!clientId || !apiKey) {
          setAuthError('Google OAuth configuration is missing. Please check your environment variables.');
          setLoading(false);
          return;
        }

        // Load the Google APIs
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });

        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });

        // Initialize Google API client
        await new Promise<void>((resolve) => {
          window.gapi.load('client', resolve);
        });

        await window.gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1'],
        });

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        // Check for existing session
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Validate the saved token is still valid
          if (userData.accessToken && await validateToken(userData.accessToken)) {
            setUser(userData);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        setAuthError('Failed to initialize Google authentication. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      setLoading(true);
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const state = params.get('state');

      if (accessToken && state === 'auth_callback') {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          
          const userData: User = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            accessToken: accessToken,
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error('Failed to get user info');
        }
      }
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error);
      setAuthError('Failed to complete sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // This is for the ID token flow, but we're using OAuth flow instead
      console.log('Credential response received, but using OAuth flow');
    } catch (error) {
      console.error('Failed to process credential:', error);
    }
  };

  const signIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setAuthError('Google Client ID is not configured.');
      return;
    }

    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    if (!redirectUri) {
      setAuthError('Google Redirect URI is not configured.');
      return;
    }

    // Start OAuth flow for Photos API access
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/photoslibrary.appendonly https://www.googleapis.com/auth/photoslibrary.sharing openid email profile',
      include_granted_scopes: 'true',
      state: 'auth_callback',
    });

    window.location.href = `${oauth2Endpoint}?${params.toString()}`;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
