export default function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="flex items-center bg-gray-200 rounded-lg p-1 w-fit shadow-inner">
      <button
        onClick={() => setLanguage('en-IN')}
        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${
          language === 'en-IN' ? 'bg-white text-teal-700 shadow' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ta-IN')}
        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${
          language === 'ta-IN' ? 'bg-white text-teal-700 shadow' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}
