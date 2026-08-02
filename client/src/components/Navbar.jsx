import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeyLuk from './HeyLuk';

export default function Navbar() {
  const { user, clinic, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quotes = [
    "Wherever the art of Medicine is loved, there is also a love of Humanity.",
    "The good physician treats the disease; the great physician treats the patient.",
    "Heal sometimes, treat often, comfort always.",
    "Medicine is a science of uncertainty and an art of probability.",
    "Observation, Reason, Human Understanding, Courage; these make the physician."
  ];
  // Pick a quote based on the day of the year to change it daily
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const todaysQuote = quotes[dayOfYear % quotes.length];


  if (!user) return null; // Don't show navbar if not logged in

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <nav className="bg-teal-700 text-white shadow-md no-print sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-6 w-1/3">
            <Link to="/" className="text-lg sm:text-xl font-bold tracking-wide flex items-center gap-2 shrink-0">
              <span>🏥</span> {clinic ? clinic.clinicName : 'LukBill'}
            </Link>
            
            {clinic && (
              <div className="hidden md:flex gap-6 text-sm font-semibold">
                <Link 
                  to="/" 
                  className={`hover:text-teal-200 transition-colors ${isActive('/') ? 'text-white underline underline-offset-4' : 'text-teal-100'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/patients/new" 
                  className={`hover:text-teal-200 transition-colors ${isActive('/patients/new') ? 'text-white underline underline-offset-4' : 'text-teal-100'}`}
                >
                  New Consult
                </Link>
                <Link 
                  to="/inventory" 
                  className={`hover:text-teal-200 transition-colors ${isActive('/inventory') ? 'text-white underline underline-offset-4' : 'text-teal-100'}`}
                >
                  Inventory
                </Link>
              </div>
            )}
          </div>

          {/* Top-Mid Motivational Quote (Hidden on small screens) */}
          <div className="hidden lg:flex flex-1 justify-center px-4">
            <p className="text-teal-100 text-xs italic opacity-90 text-center max-w-md">
              "{todaysQuote}"
            </p>
          </div>

          <div className="flex items-center gap-4 w-1/3 justify-end">
            {clinic && <HeyLuk />}
            
            <div className="flex items-center gap-3 border-l border-teal-600 pl-4 hidden sm:flex">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8B93&color=fff&rounded=true`} 
                alt="Doctor Avatar" 
                className="w-9 h-9 rounded-full border-2 border-teal-500 shadow-sm"
              />
              <div className="text-sm">
                <p className="font-semibold text-xs leading-tight">{user.name}</p>
                <button onClick={handleLogout} className="text-teal-200 hover:text-white text-[11px] underline">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sticky Mobile Bottom Navigation Bar */}
      {clinic && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-teal-900 text-teal-100 shadow-2xl z-50 border-t border-teal-800 no-print">
          <div className="grid grid-cols-4 items-center text-center py-2 px-1">
            <Link 
              to="/" 
              className={`flex flex-col items-center py-1 rounded-lg transition-all ${isActive('/') ? 'text-white font-bold bg-teal-800/80' : 'text-teal-300 opacity-80'}`}
            >
              <span className="text-xl">🏠</span>
              <span className="text-[10px] mt-0.5">Home</span>
            </Link>

            <Link 
              to="/patients/new" 
              className={`flex flex-col items-center py-1 rounded-lg transition-all ${isActive('/patients/new') ? 'text-white font-bold bg-teal-800/80' : 'text-teal-300 opacity-80'}`}
            >
              <span className="text-xl">➕</span>
              <span className="text-[10px] mt-0.5">Consult</span>
            </Link>

            <Link 
              to="/inventory" 
              className={`flex flex-col items-center py-1 rounded-lg transition-all ${isActive('/inventory') ? 'text-white font-bold bg-teal-800/80' : 'text-teal-300 opacity-80'}`}
            >
              <span className="text-xl">💊</span>
              <span className="text-[10px] mt-0.5">Inventory</span>
            </Link>

            <button 
              onClick={handleLogout}
              className="flex flex-col items-center py-1 rounded-lg text-teal-300 opacity-80 hover:text-red-300 active:scale-95"
            >
              <span className="text-xl">🚪</span>
              <span className="text-[10px] mt-0.5">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
