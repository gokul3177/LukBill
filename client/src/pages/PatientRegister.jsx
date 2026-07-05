import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PatientRegister() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', address: '', phone: '', occupation: ''
  });

  const navigate = useNavigate();

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await axios.get(`/api/patients?q=${searchQuery}`);
          setPatients(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPatients([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPatient = (patient) => {
    // Jump straight to prescribe for existing patient
    navigate(`/prescribe`, { state: { patient } });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/patients', formData);
      toast.success("Patient registered successfully!");
      // Navigate to prescribe passing the new patient data in state
      navigate(`/prescribe`, { state: { patient: res.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="max-w-4xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Left: Search Existing */}
      <div>
        <h2 className="text-2xl font-bold text-teal-800 mb-4">🔍 Search Existing</h2>
        <input 
          type="text" 
          placeholder="Search by Name or Phone number..." 
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {isSearching ? (
          <p className="text-gray-500 text-sm">Searching...</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {patients.map(p => (
              <div key={p._id} className="bg-white p-4 rounded-lg shadow border hover:border-teal-500 cursor-pointer transition-colors"
                   onClick={() => handleSelectPatient(p)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <p className="text-sm text-gray-600">{p.age} yrs • {p.gender}</p>
                    <p className="text-xs text-gray-500 mt-1">📞 {p.phone}</p>
                  </div>
                  <button className="text-teal-600 text-sm font-semibold hover:underline">Select &rarr;</button>
                </div>
              </div>
            ))}
            {searchQuery.length > 1 && patients.length === 0 && (
              <p className="text-gray-500 text-sm italic">No patients found. Register new.</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Register New */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-teal-600 h-fit">
        <h2 className="text-2xl font-bold text-teal-800 mb-4">📝 Register New Patient</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Patient Name</label>
            <input type="text" name="name" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Age</label>
              <input type="number" name="age" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Gender</label>
              <select name="gender" className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} value={formData.gender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
            <input type="text" name="phone" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Address</label>
            <textarea name="address" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange}></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Occupation (Optional)</label>
            <input type="text" name="occupation" className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-teal-500" onChange={handleChange} />
          </div>

          <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 mt-2">
            Register & Continue &rarr;
          </button>
        </form>
      </div>

    </div>
  );
}
