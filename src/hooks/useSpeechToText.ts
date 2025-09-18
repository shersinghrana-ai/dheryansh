import { useState, useEffect, useRef } from 'react';

interface SpeechToTextState {
  text: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const useSpeechToText = () => {
  const [state, setState] = useState<SpeechToTextState>({
    text: '',
    isListening: false,
    isSupported: false,
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure recognition settings
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Start with English, can be changed
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event);
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          console.log('Transcript:', transcript);
          setState(prev => ({ 
            ...prev, 
            text: transcript, 
            isListening: false,
            error: null
          }));
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition failed';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: errorMessage
        }));
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      setState(prev => ({ ...prev, isSupported: true }));
    } else {
      console.log('Speech recognition not supported');
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      }));
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current || state.isListening) return;

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Clear previous text and error
      setState(prev => ({ ...prev, text: '', error: null }));
      
      // Start recognition
      recognitionRef.current.start();
    } catch (error) {
      console.error('Microphone permission error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Microphone permission denied. Please allow microphone access and try again.'
      }));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetText = () => {
    setState(prev => ({ ...prev, text: '', error: null }));
  };

  const setLanguage = (lang: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  };

  return {
    ...state,
    startListening,
    stopListening,
    resetText,
    setLanguage
  };
};