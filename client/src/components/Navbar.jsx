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

  if (!user) return null; // Don't show navbar if not logged in

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <nav className="bg-teal-700 text-white shadow-md no-print sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg sm:text-xl font-bold tracking-wide flex items-center gap-2">
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

          <div className="flex items-center gap-3">
            {clinic && <HeyLuk />}
            
            <div className="text-sm border-l border-teal-600 pl-3 hidden sm:block">
              <p className="font-semibold text-xs leading-tight">{user.name}</p>
              <button onClick={handleLogout} className="text-teal-200 hover:text-white text-[11px] underline">
                Logout
              </button>
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
