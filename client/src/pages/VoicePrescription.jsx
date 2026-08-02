import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import VoiceButton from '../components/VoiceButton';
import LanguageToggle from '../components/LanguageToggle';

export default function VoicePrescription() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const patient = state?.patient;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [isParsing, setIsParsing] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript(''); // clear previous on new recording
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleParse = async () => {
    if (!transcript.trim()) {
      return toast.error("Please record a prescription first.");
    }

    setIsParsing(true);
    try {
      const res = await axios.post('/api/voice/parse', { transcript });
      
      // Navigate to Review page passing patient and parsed data
      navigate('/prescribe/review', { 
        state: { 
          patient, 
          parsedData: res.data 
        } 
      });

    } catch (error) {
      toast.error("Failed to parse prescription.");
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  };

  if (!patient) return <Navigate to="/patients/new" replace />;

  return (
    <div className="max-w-3xl mx-auto mt-2 sm:mt-6 bg-white p-4 sm:p-8 rounded-xl shadow-lg border-t-4 border-teal-600">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Voice Prescription</h2>
          <p className="text-sm text-gray-600 mt-1">
            Patient: <span className="font-bold text-teal-700">{patient.name}</span> ({patient.age}y/{patient.gender})
          </p>
        </div>
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>

      <div className="flex flex-col items-center py-8 sm:py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <VoiceButton isListening={isListening} onClick={toggleListen} />
        <p className="mt-5 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide text-center px-4">
          {isListening ? '🎙️ Listening... Tap to stop' : '👇 Tap mic to start dictating prescription'}
        </p>
      </div>

      <div className="mt-6">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Live Transcript</label>
        <textarea 
          className="w-full p-3 sm:p-4 border rounded-xl h-36 focus:ring-2 focus:ring-teal-500 bg-white text-sm"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Dictate prescription or edit transcript here..."
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => navigate('/patients/new')} 
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 active:scale-95 transition-all text-center"
        >
          Cancel
        </button>
        <button 
          onClick={handleParse} 
          disabled={isParsing || !transcript.trim()}
          className="w-full sm:flex-1 bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-base transition-all"
        >
          {isParsing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing with AI...
            </>
          ) : (
             'Process Prescription 🚀'
          )}
        </button>
      </div>

    </div>
  );
}
