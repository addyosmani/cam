import React, { useRef, useEffect, useState } from 'react';
import { Camera, RotateCcw, Download, Upload, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoUrl: string) => void;
  disabled?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, disabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setCameraError('Camera access denied. Please allow camera permissions and refresh the page.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraReady(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    setCapturing(true);
    
    // Add a small delay for the capture animation
    await new Promise(resolve => setTimeout(resolve, 200));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Flip the image horizontally for mirror effect
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      
      // Convert to data URL for easier handling
      const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(photoUrl);
      setCapturing(false);
    }
  };

  if (cameraError) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="p-4 bg-red-50 rounded-full w-fit mx-auto mb-4">
          <Camera className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Required</h3>
        <p className="text-gray-600 mb-6">{cameraError}</p>
        <button
          onClick={startCamera}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          <RotateCcw className="w-5 h-5 inline mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${
            cameraReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Initializing camera...</p>
            </div>
          </div>
        )}

        {capturing && (
          <div className="absolute inset-0 bg-white animate-pulse" />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6">
        <div className="flex justify-center">
          <button
            onClick={capturePhoto}
            disabled={!cameraReady || capturing || disabled}
            className={`w-20 h-20 rounded-full border-4 border-blue-600 bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-300 transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${
              capturing ? 'animate-pulse' : ''
            }`}
          >
            {capturing ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
          </button>
        </div>
        
        {disabled && (
          <p className="text-center text-sm text-gray-500 mt-4">
            You've already taken your selfie today! Come back tomorrow.
          </p>
        )}
      </div>
    </div>
  );
};