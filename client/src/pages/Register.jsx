import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();
  const { login } = useAuth(); // Just to store token if needed, or we can just redirect to login

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }

    try {
      const res = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Auto login after register
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // We know they don't have a clinic setup yet since they just registered
      window.location.href = '/clinic-setup'; 
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">Create LukBill Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Full Name</label>
          <input type="text" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <input type="email" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <input type="password" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
          <input type="password" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-700">
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-teal-600 font-semibold">Login</Link>
      </p>
    </div>
  );
}
