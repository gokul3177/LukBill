import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function HeyLuk() {
  const [isActive, setIsActive] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { clinic } = useAuth();
  const wsRef = useRef(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    // Setup WebSocket
    if (clinic) {
      // Determine WebSocket URL from env or fallback to local
      const wsBase = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws')
        : `ws://${window.location.hostname}:5000`;
      
      const wsUrl = `${wsBase}?clinicId=${clinic._id}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ASSISTANT_CALLED') {
          // Push notification panel (simulated with large toast for now)
          toast.custom((t) => (
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-2xl flex flex-col gap-2 max-w-sm w-full animate-bounce">
              <h1 className="text-2xl font-bold">🔔 Assistant Called!</h1>
              <p className="text-lg">{data.message}</p>
            </div>
          ), { duration: 8000 });
        }
      };

      return () => {
        if (wsRef.current) {
          if (wsRef.current.readyState === 1) {
            wsRef.current.close();
          } else {
            wsRef.current.onopen = () => wsRef.current.close();
          }
        }
      };
    }
  }, [clinic]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech Recognition not supported for Hey Luk");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      
      console.log("Hey Luk heard:", transcript);

      if (transcript.includes('hey look') || transcript.includes('hey luke') || transcript.includes('hey luk')) {
        
        if (transcript.includes('next patient')) {
          toast.success("Navigating to Next Patient");
          navigate('/patients/new');
        } 
        else if (transcript.includes('open inventory')) {
          toast.success("Opening Inventory");
          navigate('/inventory');
        }
        else if (transcript.includes('call')) {
          const nameMatch = transcript.match(/call (.+)/);
          const name = nameMatch ? nameMatch[1] : 'assistant';
          toast.success(`Calling ${name}...`);
          
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'CALL_ASSISTANT',
              message: `Doctor is calling for ${name}`
            }));
          }
        } else {
          toast('Listening: "Hey Luk, [command]"', { icon: '🤖' });
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart if still active
      if (isActiveRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    if (isActive) {
      try {
        recognition.start();
        toast.success("Hey Luk assistant is listening...", { position: 'bottom-right' });
      } catch (e) {}
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isActive, navigate]);

  return (
    <button
      onClick={() => setIsActive(!isActive)}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1 ${
        isActive ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-900 text-teal-100 hover:bg-teal-800'
      }`}
      title="Toggle 'Hey Luk' Voice Assistant"
    >
      <span className="text-lg">🤖</span> {isActive ? 'Listening' : 'Hey Luk'}
    </button>
  );
}
