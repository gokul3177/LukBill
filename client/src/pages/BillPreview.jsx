import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PrintTemplate from '../components/PrintTemplate';

export default function BillPreview() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillAndPatient = async () => {
      try {
        const res = await axios.get(`/api/billing/${id}`);
        setBill(res.data);
        
        const patRes = await axios.get(`/api/patients/${res.data.patientId}`);
        setPatient(patRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBillAndPatient();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center mt-20">Loading bill...</div>;
  if (!bill) return <div className="text-center mt-20 text-red-500">Bill not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-4">
      
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold text-gray-800">Bill Preview</h2>
        <div className="flex gap-4">
          <Link to="/" className="px-4 py-2 bg-gray-200 rounded font-semibold hover:bg-gray-300">Dashboard</Link>
          <button onClick={handlePrint} className="px-6 py-2 bg-teal-600 text-white font-bold rounded shadow hover:bg-teal-700">
            🖨️ Print Bill
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden border">
        {/* Render the printable component here */}
        <PrintTemplate bill={bill} patient={patient} />
      </div>

    </div>
  );
}
