import React, { useState } from 'react';
import { Check, Upload, X, Download } from 'lucide-react';
import { useSelfie } from '../contexts/SelfieContext';
import { Selfie } from '../types/selfie';

interface SelfiePreviewProps {
  selfie: Selfie;
  onClose: () => void;
  onSave: () => void;
}

export const SelfiePreview: React.FC<SelfiePreviewProps> = ({ selfie, onClose, onSave }) => {
  const { uploadToGooglePhotos, loading } = useSelfie();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(selfie.uploaded);

  const handleUpload = async () => {
    setUploading(true);
    const success = await uploadToGooglePhotos(selfie);
    if (success) {
      setUploaded(true);
    }
    setUploading(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = selfie.photoUrl;
    link.download = `selfie-${selfie.date}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Today's Selfie</h3>
              <p className="text-sm text-gray-500">{selfie.date}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            <img
              src={selfie.photoUrl}
              alt="Captured selfie"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            {!uploaded ? (
              <button
                onClick={handleUpload}
                disabled={uploading || loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload to Google Photos</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 bg-green-100 text-green-800 font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Uploaded to Google Photos</span>
              </div>
            )}

            <button
              onClick={onSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};