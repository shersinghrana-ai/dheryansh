import { useState, useEffect } from 'react';

interface SpeechToTextState {
  text: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

export const useSpeechToText = () => {
  const [state, setState] = useState<SpeechToTextState>({
    text: '',
    isListening: false,
    isSupported: false,
    error: null
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'hi-IN,en-IN,en-US';

      recognitionInstance.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setState(prev => ({ ...prev, text: transcript, isListening: false }));
      };

      recognitionInstance.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: `Speech recognition error: ${event.error}` 
        }));
      };

      recognitionInstance.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      setRecognition(recognitionInstance);
      setState(prev => ({ ...prev, isSupported: true }));
    } else {
      setState(prev => ({ ...prev, isSupported: false }));
    }
  }, []);

  const startListening = () => {
    if (recognition && !state.isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && state.isListening) {
      recognition.stop();
    }
  };

  const resetText = () => {
    setState(prev => ({ ...prev, text: '' }));
  };

  return {
    ...state,
    startListening,
    stopListening,
    resetText
  };
};