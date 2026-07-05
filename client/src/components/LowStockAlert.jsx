import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const { clinic } = useAuth();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('/api/inventory');
        const threshold = clinic?.lowStockThreshold || 10;
        const low = res.data.filter(item => item.stock < threshold);
        setLowStockItems(low);
      } catch (error) {
        console.error("Failed to fetch inventory for alerts", error);
      }
    };
    if (clinic) {
      fetchInventory();
    }
  }, [clinic]);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 mb-6 rounded shadow-sm flex justify-between items-center no-print">
      <div>
        <p className="font-bold flex items-center gap-2">
          ⚠️ Low Stock Alert
        </p>
        <p className="text-sm">
          {lowStockItems.length} medicine(s) are running below the threshold of {clinic?.lowStockThreshold}.
        </p>
      </div>
      <Link to="/inventory" className="text-sm font-semibold underline hover:text-orange-900">
        View Inventory
      </Link>
    </div>
  );
}
