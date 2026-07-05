import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // ProtectedRoute will handle redirection to /clinic-setup if needed
      navigate('/'); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-teal-700">⚡ LukBill</h1>
        <p className="text-gray-500 mt-2">Clinic Management System</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <input type="email" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <input type="password" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-700">
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-teal-600 font-semibold">Register</Link>
      </p>
    </div>
  );
}
