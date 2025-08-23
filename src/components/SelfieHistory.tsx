import React from 'react';
import { Calendar, Upload, Check, Image } from 'lucide-react';
import { useSelfie } from '../contexts/SelfieContext';

export const SelfieHistory: React.FC = () => {
  const { selfies } = useSelfie();

  const sortedSelfies = [...selfies].sort((a, b) => b.timestamp - a.timestamp);

  if (selfies.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Selfies Yet</h3>
        <p className="text-gray-600">
          Take your first daily selfie to start building your photo journey!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span>Your Selfie Journey</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {selfies.length} selfie{selfies.length !== 1 ? 's' : ''} captured
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedSelfies.map((selfie) => (
            <div key={selfie.id} className="group relative">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                <img
                  src={selfie.photoUrl}
                  alt={`Selfie from ${selfie.date}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              <div className="absolute top-2 right-2">
                {selfie.uploaded ? (
                  <div className="p-1.5 bg-green-600 rounded-full shadow-md">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-orange-500 rounded-full shadow-md">
                    <Upload className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700">{selfie.date}</p>
                <p className="text-xs text-gray-500">
                  {selfie.uploaded ? 'Synced' : 'Local only'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};