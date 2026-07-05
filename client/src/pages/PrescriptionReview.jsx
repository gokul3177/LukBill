import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import MedicineTable from '../components/MedicineTable';

export default function PrescriptionReview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const patient = state?.patient;
  const parsedData = state?.parsedData;

  const [medicines, setMedicines] = useState(parsedData?.medicines || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!patient || !parsedData) return <Navigate to="/patients/new" replace />;

  const handleApproveAndGenerateBill = async () => {
    // Validate all items are matched
    const unmatched = medicines.find(m => !m.medicineId);
    if (unmatched) {
      return toast.error("Please match all medicines to inventory or remove them.");
    }

    setIsSubmitting(true);
    try {
      // 1. Create Prescription
      const presRes = await axios.post('/api/prescriptions', {
        patientId: patient._id,
        medicines
      });

      // 2. Generate Bill
      const billRes = await axios.post('/api/billing/generate', {
        prescriptionId: presRes.data._id
      });

      toast.success("Prescription Approved & Bill Generated!");
      
      // Navigate to Bill preview passing bill id
      navigate(`/bill/${billRes.data._id}`);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve prescription');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-4 bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Review Prescription</h2>
          <p className="text-gray-600 mt-1">
            Patient: <span className="font-bold">{patient.name}</span>
          </p>
        </div>
        <p className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded">
          Please verify AI extraction and match stock.
        </p>
      </div>

      <MedicineTable medicines={medicines} setMedicines={setMedicines} />

      <div className="mt-8 flex justify-end gap-4 border-t pt-6">
        <button 
          onClick={() => navigate('/prescribe', { state: { patient } })}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300"
        >
          &larr; Back to Voice
        </button>
        <button 
          onClick={handleApproveAndGenerateBill}
          disabled={isSubmitting || medicines.length === 0}
          className="px-8 py-2 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Approve & Generate Bill'}
        </button>
      </div>
    </div>
  );
}
