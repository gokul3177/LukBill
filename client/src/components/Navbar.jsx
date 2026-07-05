import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeyLuk from './HeyLuk';

export default function Navbar() {
  const { user, clinic, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="bg-teal-700 text-white shadow-md no-print">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-4">
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-wide">
            {clinic ? clinic.clinicName : 'LukBill'}
          </Link>
          
          {clinic && (
            <div className="hidden md:flex gap-4">
              <Link to="/patients/new" className="hover:text-teal-200 transition-colors">New Patient</Link>
              <Link to="/inventory" className="hover:text-teal-200 transition-colors">Inventory</Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {clinic && <HeyLuk />}
          
          <div className="text-sm border-l border-teal-600 pl-4">
            <p className="font-semibold">{user.name}</p>
            <button onClick={handleLogout} className="text-teal-200 hover:text-white text-xs underline">
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {clinic && (
        <div className="md:hidden bg-teal-800 px-4 py-2 flex gap-4 text-sm overflow-x-auto">
           <Link to="/patients/new" className="whitespace-nowrap hover:text-teal-200">New Patient</Link>
           <Link to="/inventory" className="whitespace-nowrap hover:text-teal-200">Inventory</Link>
        </div>
      )}
    </nav>
  );
}
