import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('If the email exists, an OTP has been sent.');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
        <p className="text-gray-500 mt-2 text-sm">Enter your registered email address to receive an OTP.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Email Address</label>
          <input type="email" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-700 disabled:opacity-50 transition">
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Remember your password? <Link to="/login" className="text-teal-600 font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
}
