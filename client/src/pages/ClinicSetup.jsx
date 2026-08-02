import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ClinicSetup() {
  const [formData, setFormData] = useState({
    clinicName: '', doctorName: '', address: '', phone: '',
    registrationNumber: '', consultationFee: 200, lowStockThreshold: 10
  });
  
  const { updateClinic, updateUser, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/clinic/setup', formData);
      updateClinic(res.data);
      
      // Also update user in both state and localStorage to reflect clinicId
      const updatedUser = { ...user, clinicId: res.data._id };
      updateUser(updatedUser);

      toast.success("Clinic Setup Complete!");
      navigate('/'); // Go to dashboard
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-4">
      <h2 className="text-2xl font-bold text-teal-800 mb-2">Welcome to LukBill! 🏥</h2>
      <p className="text-gray-600 mb-6">Let's set up your clinic details. This information will appear on printed bills.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">Clinic Name</label>
          <input type="text" name="clinicName" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Doctor's Name</label>
          <input type="text" name="doctorName" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Registration Number</label>
          <input type="text" name="registrationNumber" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">Clinic Address</label>
          <textarea name="address" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange}></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
          <input type="text" name="phone" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Consultation Fee (₹)</label>
          <input type="number" name="consultationFee" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" value={formData.consultationFee} onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Low Stock Threshold</label>
          <input type="number" name="lowStockThreshold" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" value={formData.lowStockThreshold} onChange={handleChange} />
        </div>

        <div className="md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-teal-700 text-lg">
            Complete Setup & Go to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}
