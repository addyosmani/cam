import React, { useState } from 'react';
import { Calendar, Zap, Trophy, Target, Check } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { SelfiePreview } from './SelfiePreview';
import { SelfieHistory } from './SelfieHistory';
import { useSelfie } from '../contexts/SelfieContext';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { selfies, todaysSelfie, addSelfie } = useSelfie();
  const [capturedSelfie, setCapturedSelfie] = useState<any>(null);

  const handleCapture = (photoUrl: string) => {
    const today = new Date();
    const selfieData = {
      date: today.toDateString(),
      timestamp: today.getTime(),
      photoUrl,
      uploaded: false,
    };
    
    setCapturedSelfie(selfieData);
  };

  const handleSaveAndContinue = () => {
    if (capturedSelfie) {
      addSelfie(capturedSelfie);
      setCapturedSelfie(null);
    }
  };

  const streak = calculateStreak(selfies);
  const thisWeekSelfies = getThisWeekSelfies(selfies);
  const totalSelfies = selfies.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-gray-600">
          {todaysSelfie 
            ? "You've captured today's selfie! Check back tomorrow for your next one." 
            : "Ready to capture today's selfie? Let's keep the streak going!"
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSelfies}</p>
              <p className="text-sm text-gray-600">Total Selfies</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{streak}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{thisWeekSelfies}</p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{getLevel(totalSelfies)}</p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {todaysSelfie ? "Today's Selfie" : "Capture Today's Selfie"}
        </h3>
        
        {todaysSelfie ? (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <img
                src={todaysSelfie.photoUrl}
                alt="Today's selfie"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Selfie captured!</p>
                  <p className="text-sm text-gray-600">
                    {todaysSelfie.uploaded ? 'Synced to Google Photos' : 'Saved locally'}
                  </p>
                </div>
                {todaysSelfie.uploaded && (
                  <div className="p-2 bg-green-50 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <CameraCapture 
            onCapture={handleCapture}
            disabled={!!todaysSelfie}
          />
        )}
      </div>

      {/* Selfie History */}
      <SelfieHistory />

      {/* Selfie Preview Modal */}
      {capturedSelfie && (
        <SelfiePreview
          selfie={capturedSelfie}
          onClose={() => setCapturedSelfie(null)}
          onSave={handleSaveAndContinue}
        />
      )}
    </div>
  );
};

// Helper functions
function calculateStreak(selfies: any[]): number {
  if (selfies.length === 0) return 0;
  
  const sortedSelfies = [...selfies].sort((a, b) => b.timestamp - a.timestamp);
  let streak = 0;
  let currentDate = new Date();
  
  for (const selfie of sortedSelfies) {
    const selfieDate = new Date(selfie.timestamp);
    const daysDiff = Math.floor((currentDate.getTime() - selfieDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
    
    currentDate = selfieDate;
  }
  
  return streak;
}

function getThisWeekSelfies(selfies: any[]): number {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  
  return selfies.filter(selfie => 
    new Date(selfie.timestamp) >= weekStart
  ).length;
}

function getLevel(totalSelfies: number): number {
  if (totalSelfies < 7) return 1;
  if (totalSelfies < 30) return 2;
  if (totalSelfies < 100) return 3;
  if (totalSelfies < 365) return 4;
  return 5;
}