import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel?: () => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  className = '',
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
}) => {
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, maxWidth, maxHeight]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL with specified quality
    const imageDataUrl = canvas.toDataURL('image/jpeg', quality);
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [quality, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  }, [capturedImage, onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isActive) {
      stopCamera();
      // Restart with new facing mode
      setTimeout(() => startCamera(), 100);
    }
  }, [isActive, stopCamera, startCamera]);

  const handleCancel = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    onCancel?.();
  }, [stopCamera, onCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // If showing captured image
  if (capturedImage) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Photo Captured</h3>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-auto max-h-96 object-contain rounded-lg bg-slate-800"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={retakePhoto}
              className="flex-1"
            >
              <RotateCcw size={18} className="mr-2" />
              Retake
            </Button>
            <Button
              onClick={confirmPhoto}
              className="flex-1"
            >
              <Check size={18} className="mr-2" />
              Use Photo
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // If camera is active
  if (isActive) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Take Photo</h3>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="relative bg-slate-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-96 object-cover"
              playsInline
              muted
            />
            
            {/* Camera controls overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={switchCamera}
                className="bg-slate-900/80 backdrop-blur-sm"
              >
                <RotateCcw size={18} />
              </Button>
              
              <Button
                onClick={capturePhoto}
                size="lg"
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-200 text-slate-900"
              >
                <Camera size={24} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                className="bg-slate-900/80 backdrop-blur-sm"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Position your device to capture the issue clearly
            </p>
          </div>
        </div>
        
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </Card>
    );
  }

  // Initial state - show camera activation button
  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Camera Error</h3>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Button onClick={startCamera} loading={isLoading}>
                <Camera size={18} className="mr-2" />
                Try Again
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Take a Photo</h3>
              <p className="text-sm text-slate-400 mb-4">
                Capture a clear image of the issue to help authorities understand the problem better
              </p>
              <Button onClick={startCamera} loading={isLoading} size="lg">
                <Camera size={18} className="mr-2" />
                {isLoading ? 'Starting Camera...' : 'Open Camera'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};