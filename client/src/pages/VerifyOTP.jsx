import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('No email provided. Please start over.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error('OTP must be 6 digits.');
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      toast.success(res.data.message);
      navigate('/reset-password', { state: { resetToken: res.data.resetToken } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
      if (err.response?.data?.message?.includes('Too many failed attempts')) {
        navigate('/forgot-password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Verify OTP</h1>
        <p className="text-gray-500 mt-2 text-sm">We sent a 6-digit code to <br/><span className="font-semibold text-gray-700">{email}</span></p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">6-Digit Code</label>
          <input type="text" maxLength="6" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500 text-center tracking-widest text-lg font-semibold"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} disabled={loading} placeholder="XXXXXX" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-700 disabled:opacity-50 transition">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
