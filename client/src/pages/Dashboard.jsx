import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LowStockAlert from '../components/LowStockAlert';

export default function Dashboard() {
  const { clinic, user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto mt-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-teal-800">Welcome, Dr. {clinic?.doctorName || user?.name}</h1>
        <p className="text-gray-600">{clinic?.clinicName}</p>
      </div>

      <LowStockAlert />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <Link to="/patients/new" className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-teal-500">
          <div className="text-4xl mb-3">👨‍⚕️</div>
          <h2 className="text-xl font-bold text-gray-800">New Patient / Consult</h2>
          <p className="text-sm text-gray-500 mt-2">Register a patient and start a voice prescription.</p>
        </Link>

        <Link to="/inventory" className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-500">
          <div className="text-4xl mb-3">💊</div>
          <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-500 mt-2">Manage medicines, prices, and stock levels.</p>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-xl font-bold text-gray-800">Today's Summary</h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm border-b pb-1">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-semibold">₹{clinic?.consultationFee}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-1">
              <span className="text-gray-600">Low Stock Threshold</span>
              <span className="font-semibold">{clinic?.lowStockThreshold} units</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">Detailed analytics coming soon.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
