export default function VoiceButton({ isListening, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all
        ${isListening 
          ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 scale-110' 
          : 'bg-teal-600 text-white hover:bg-teal-500 hover:scale-105'
        }`}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping border-4 border-red-400 opacity-75"></span>
      )}
      🎙️
    </button>
  );
}
