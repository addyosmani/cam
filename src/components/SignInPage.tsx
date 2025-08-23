import React from 'react';
import { Camera, Upload, Clock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SignInPage: React.FC = () => {
  const { signIn, loading, authError } = useAuth();

  const features = [
    {
      icon: Camera,
      title: 'Daily Capture',
      description: 'Take one beautiful selfie every day with your webcam'
    },
    {
      icon: Upload,
      title: 'Auto Sync',
      description: 'Automatically save to your Google Photos "selfies" album'
    },
    {
      icon: Clock,
      title: 'Progress Tracking',
      description: 'Build a consistent daily habit with visual progress'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your photos are stored securely in your own Google account'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full shadow-lg">
              <Camera className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Daily Selfie
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Capture your journey one selfie at a time. Build a consistent daily habit 
            while automatically backing up your memories to Google Photos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-3 bg-blue-50 rounded-full w-fit mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-red-800 font-medium text-sm">Configuration Error</h4>
                    <p className="text-red-700 text-sm mt-1">{authError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Get Started
              </h2>
              <p className="text-gray-600">
                Sign in with Google to begin your daily selfie journey
              </p>
            </div>
            
            <button
              onClick={signIn}
              disabled={loading || !!authError}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loading || authError ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By signing in, you agree to let this app access your camera and 
                save photos to your Google Photos account in a dedicated "selfies" album.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};