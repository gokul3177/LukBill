import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!resetToken) {
      toast.error('Unauthorized access. Please request a new OTP.');
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { resetToken, newPassword });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
        <p className="text-gray-500 mt-2 text-sm">Please create a strong password for your account.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">New Password</label>
          <input type="password" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={loading} />
          <p className="text-xs text-gray-500 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special character.</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
          <input type="password" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-700 disabled:opacity-50 transition">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
