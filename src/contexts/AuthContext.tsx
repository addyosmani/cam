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

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        // Load Google APIs
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
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
          discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1'],
        });

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
      } finally {
        setLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

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
      // Exchange the credential for an access token
      await exchangeCodeForTokens(response.credential);
    } catch (error) {
      console.error('Failed to process credential:', error);
    }
  };

  const exchangeCodeForTokens = async (credential: string) => {
    try {
      // Decode the JWT to get user info
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      // Use Google OAuth2 flow to get access token with proper scopes
      const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: window.location.origin,
        response_type: 'token',
        scope: 'https://www.googleapis.com/auth/photoslibrary.appendonly https://www.googleapis.com/auth/photoslibrary.sharing',
        include_granted_scopes: 'true',
        state: 'auth_callback',
      });

      // Check if we're returning from OAuth flow
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        const urlParams = new URLSearchParams(hash.substring(1));
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
          const userData: User = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            accessToken: accessToken,
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      // If no access token in URL, redirect to OAuth flow
      window.location.href = `${oauth2Endpoint}?${params.toString()}`;
    } catch (error) {
      console.error('Failed to exchange tokens:', error);
    }
  };

  const signIn = async () => {
    // Start OAuth flow for Photos API access
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin,
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
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
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