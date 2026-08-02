import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeyLuk from './HeyLuk';
import axios from 'axios';

export default function Navbar() {
  const { user, clinic, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  // Handle custom image upload, auto-resize to 300x300 canvas & compress to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(compressedBase64);
        setUploading(false);
      };
      img.onerror = () => {
        setError('Failed to process image');
        setUploading(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const res = await axios.put('/api/auth/profile', {
        name,
        avatarUrl: avatar
      });
      updateUser(res.data.user);
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const avatarSrc = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8B93&color=fff&rounded=true`;

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
              <button 
                onClick={() => {
                  setName(user.name);
                  setAvatar(user.avatarUrl || '');
                  setIsModalOpen(true);
                }}
                className="focus:outline-none hover:opacity-85 transition-opacity"
                title="Edit Profile"
              >
                <img 
                  src={avatarSrc} 
                  alt="Doctor Avatar" 
                  className="w-9 h-9 rounded-full border-2 border-teal-500 shadow-sm object-cover"
                />
              </button>
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
              onClick={() => {
                setName(user.name);
                setAvatar(user.avatarUrl || '');
                setIsModalOpen(true);
              }}
              className="flex flex-col items-center py-1 rounded-lg text-teal-300 opacity-80 hover:text-white active:scale-95"
            >
              <img 
                src={avatarSrc} 
                alt="Doctor Avatar" 
                className="w-5 h-5 rounded-full border border-teal-400 object-cover"
              />
              <span className="text-[10px] mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit Profile</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-xl font-semibold focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-200">
                  Profile updated successfully!
                </div>
              )}

              {/* Avatar Preview & Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <img 
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doc')}&background=0D8B93&color=fff&rounded=true`} 
                    alt="PFP Preview" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-teal-100 shadow-md"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      Reading...
                    </div>
                  )}
                </div>

                <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium text-xs py-2 px-4 rounded-full border border-teal-200 transition-colors">
                  Upload New Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Doctor Name Field */}
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1 uppercase tracking-wider">
                  Doctor Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="Dr. John Doe"
                />
              </div>

              {/* Email (Read-Only) */}
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  Email Address (Verified)
                </label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 text-gray-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
