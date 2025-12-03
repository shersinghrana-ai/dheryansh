import React, { useState, useRef } from 'react';
import { Camera, MapPin, Mic, MicOff, Upload, AlertCircle, CheckCircle, Globe, Image } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { CameraCapture } from '../UI/CameraCapture';
import { ISSUE_CATEGORIES, Issue } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';

interface ReportIssueFormProps {
  onSuccess?: (issue: Issue) => void;
  onCancel?: () => void;
}

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    photo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  const { user } = useAuth();
  const { 
    text: speechText, 
    isListening, 
    isSupported: speechSupported, 
    error: speechError,
    startListening, 
    stopListening, 
    resetText,
    setLanguage
  } = useSpeechToText();

  // Update description when speech text changes
  React.useEffect(() => {
    if (speechText) {
      setFormData(prev => ({ 
        ...prev, 
        description: prev.description ? `${prev.description} ${speechText}` : speechText 
      }));
    }
  }, [speechText]);

  // Update speech recognition language when changed
  React.useEffect(() => {
    setLanguage(speechLanguage);
  }, [speechLanguage, setLanguage]);
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setFormData(prev => ({ ...prev, photo: imageDataUrl }));
    setShowCamera(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError('Location is required to submit an issue');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setShowDuplicateWarning(false);

    try {
      const issue = await mockApi.createIssue({
        title: formData.title || `${formData.category} issue`,
        description: formData.description,
        category: formData.category,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
        },
        photo: formData.photo || undefined,
        submittedBy: user?.id || 'anonymous'
      });

      onSuccess?.(issue);
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE_FOUND') {
        setShowDuplicateWarning(true);
      } else {
        setError('Failed to submit issue. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show camera capture interface
  if (showCamera) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          maxWidth={1920}
          maxHeight={1080}
          quality={0.8}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Report New Issue</h2>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {showDuplicateWarning && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-300">
              <AlertCircle size={20} />
              <div>
                <p className="font-medium">Similar Issue Found</p>
                <p className="text-sm mt-1">A similar issue has been reported recently in this area. You can upvote the existing report to increase its priority.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Issue Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {ISSUE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Photo (Optional)
            </label>
            <div className="space-y-3">
              {formData.photo && (
                <div className="relative">
                  <img
                    src={formData.photo}
                    alt="Issue preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCamera(true)}
                  className="flex-1"
                >
                  <Camera size={18} className="mr-2" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Image size={18} className="mr-2" />
                  Upload
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Description with Voice-to-Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description * 
              {speechSupported && (
                <span className="text-xs text-slate-400 ml-2">
                  (Voice input supported)
                </span>
              )}
            </label>
            
            {/* Language Selection for Voice Input */}
            {speechSupported && (
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-slate-400" />
                  <select
                    value={speechLanguage}
                    onChange={(e) => setSpeechLanguage(e.target.value)}
                    className="text-xs px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">हिंदी (Hindi)</option>
                    <option value="bn-IN">বাংলা (Bengali)</option>
                    <option value="te-IN">తెలుగు (Telugu)</option>
                    <option value="ta-IN">தமிழ் (Tamil)</option>
                    <option value="mr-IN">मराठी (Marathi)</option>
                    <option value="gu-IN">ગુજરાતી (Gujarati)</option>
                  </select>
                  <span className="text-xs text-slate-400">Voice language</span>
                </div>
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full px-3 py-2 pr-12 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                  isListening ? 'border-red-500 bg-red-500/10' : 'border-slate-600'
                }`}
                placeholder="Describe the issue in detail..."
                required
              />
              
              {speechSupported && (
                <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                  {speechError && (
                    <div className="text-xs text-red-400 mr-2 max-w-32 truncate" title={speechError}>
                      Error
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 ${
                      isListening 
                        ? 'text-red-400 bg-red-500/20 animate-pulse' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </Button>
                </div>
              )}
            </div>
            
            {isListening && (
              <div className="mt-2 text-sm text-orange-400 flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>🎤 Listening... Speak clearly in {speechLanguage.includes('hi') ? 'Hindi' : speechLanguage.includes('bn') ? 'Bengali' : speechLanguage.includes('te') ? 'Telugu' : speechLanguage.includes('ta') ? 'Tamil' : speechLanguage.includes('mr') ? 'Marathi' : speechLanguage.includes('gu') ? 'Gujarati' : 'English'}</span>
              </div>
            )}

            {speechError && (
              <div className="mt-2 text-sm text-red-400 flex items-center space-x-2">
                <AlertCircle size={16} />
                <span>{speechError}</span>
              </div>
            )}

            {speechText && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-green-400 flex items-center space-x-1">
                  <CheckCircle size={16} />
                  <span>Voice input added to description</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetText}
                  className="text-xs"
                >
                  Clear Voice
                </Button>
              </div>
            )}
            
            {!speechSupported && (
              <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>Voice input not supported in this browser. Try Chrome, Edge, or Safari.</span>
              </div>
            )}
          </div>

          {/* Location Display */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <div className="p-3 bg-slate-700 border border-slate-600 rounded-lg">
              {locationLoading ? (
                <div className="flex items-center space-x-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Detecting location...</span>
                </div>
              ) : locationError ? (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle size={16} />
                  <span>Location error: {locationError}</span>
                </div>
              ) : location ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={16} />
                  <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin size={16} />
                  <span>No location detected</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!location || !formData.category || !formData.description}
              className="flex-1"
            >
              Submit Issue
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};