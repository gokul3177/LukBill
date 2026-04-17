import React, { useEffect, useState, useRef } from 'react';

const WaveBar = ({ delay }) => (
  <span
    className="inline-block w-1 rounded-full bg-blue-400"
    style={{
      height: '8px',
      animation: 'wavebar 0.8s ease-in-out infinite alternate',
      animationDelay: delay,
    }}
  />
);

const VoiceInput = ({ onTranscript, transcript, onClear, darkMode }) => {
  const [listening,  setListening]  = useState(false);
  const [supported,  setSupported]  = useState(true);
  const recognitionRef = useRef(null);

  const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      onTranscript(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied.');
        setListening(false);
      }
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported) return alert('Browser does not support speech recognition.');
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Waveform animation — only visible while recording */}
      <div className={`flex items-end gap-[3px] h-8 transition-opacity duration-300 ${listening ? 'opacity-100' : 'opacity-0'}`}>
        {['0s','0.1s','0.2s','0.3s','0.15s','0.25s','0.05s','0.35s'].map((d, i) => (
          <WaveBar key={i} delay={d} />
        ))}
      </div>

      {/* Mic Button — min 64px for mobile */}
      <button
        id="mic-toggle-btn"
        type="button"
        onClick={toggleListening}
        className={`
          min-w-[64px] min-h-[64px] w-20 h-20
          rounded-full font-bold transition-all duration-200
          shadow-xl flex flex-col items-center justify-center gap-1
          text-white text-xs
          ${listening
            ? 'bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-300 animate-pulse'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}
        `}
        aria-label={listening ? 'Stop Recording' : 'Start Recording'}
      >
        <span className="text-2xl">{listening ? '⏹' : '🎙️'}</span>
        <span>{listening ? 'Stop' : 'Record'}</span>
      </button>

      {/* Status + word count row */}
      <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {listening
          ? <span className="text-red-500 font-medium animate-pulse">● Recording…</span>
          : <span>{supported ? 'Tap to dictate a bill' : '⚠️ Not supported in this browser'}</span>
        }
        {wordCount > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Clear & Restart button */}
      {transcript && (
        <button
          type="button"
          onClick={() => { if (recognitionRef.current && listening) recognitionRef.current.stop(); onClear(); }}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium
            ${darkMode
              ? 'border-gray-600 text-gray-400 hover:bg-gray-800'
              : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}
        >
          🗑️ Clear & Restart
        </button>
      )}

      {/* Keyframe style for waveform bars */}
      <style>{`
        @keyframes wavebar {
          from { height: 4px;  opacity: 0.5; }
          to   { height: 28px; opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

export default VoiceInput;
