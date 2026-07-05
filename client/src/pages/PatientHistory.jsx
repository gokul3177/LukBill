import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PatientHistory() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [patRes, preRes, billRes] = await Promise.all([
          axios.get(`/api/patients/${id}`),
          axios.get(`/api/prescriptions/patient/${id}`),
          axios.get(`/api/billing/patient/${id}`)
        ]);

        setPatient(patRes.data);
        setPrescriptions(preRes.data);
        setBills(billRes.data);
      } catch (err) {
        toast.error("Failed to load patient history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading history...</div>;
  if (!patient) return <div className="text-center mt-20 text-red-500">Patient not found</div>;

  return (
    <div className="max-w-5xl mx-auto mt-4">
      
      <div className="bg-teal-700 text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{patient.name}</h2>
          <p className="opacity-90 mt-1">{patient.age} yrs • {patient.gender} • 📞 {patient.phone}</p>
          <p className="opacity-80 text-sm">{patient.address}</p>
        </div>
        <div>
          <Link to={`/prescribe`} state={{ patient }} className="bg-white text-teal-800 font-bold px-4 py-2 rounded shadow hover:bg-gray-100">
             + New Consult
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Prescriptions Timeline */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Consultations</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {prescriptions.length === 0 && <p className="text-gray-500 italic">No past consultations.</p>}
            
            {prescriptions.map(pre => (
              <div key={pre._id} className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r-lg shadow-sm">
                <p className="text-sm text-gray-500 font-semibold">{new Date(pre.date).toLocaleString()}</p>
                <div className="mt-2 space-y-1">
                  {pre.medicines.map((m, i) => (
                    <div key={i} className="text-sm">
                      • <span className="font-semibold">{m.name}</span> ({m.dosage}) - {m.timing} for {m.duration}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs font-bold uppercase text-gray-400">Status: {pre.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bills */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🧾 Billing History</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {bills.length === 0 && <p className="text-gray-500 italic">No past bills.</p>}
            
            {bills.map(bill => (
              <div key={bill._id} className="border p-4 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">₹{bill.grandTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">Items: {bill.items.length}</p>
                </div>
                <div>
                  <Link to={`/bill/${bill._id}`} className="text-teal-600 font-semibold text-sm border border-teal-600 px-3 py-1 rounded hover:bg-teal-50">
                    View Bill &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
