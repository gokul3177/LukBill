export default function VoiceButton({ isListening, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={isListening ? "Stop Listening" : "Start Listening"}
      className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-xl transition-all duration-300 active:scale-95 select-none
        ${isListening 
          ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 scale-105 ring-8 ring-red-200' 
          : 'bg-teal-600 text-white hover:bg-teal-500 hover:scale-105 shadow-teal-600/30'
        }`}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping border-4 border-red-400 opacity-75"></span>
      )}
      🎙️
    </button>
  );
}
