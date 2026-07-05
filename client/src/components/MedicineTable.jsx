import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MedicineTable({ medicines, setMedicines }) {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('/api/inventory');
        setInventory(res.data);
      } catch (error) {
        console.error("Failed to fetch inventory", error);
      }
    };
    fetchInventory();
  }, []);

  const handleChange = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handleAlternativeSelect = (index, invItem) => {
    const newMeds = [...medicines];
    newMeds[index] = {
      ...newMeds[index],
      medicineId: invItem._id,
      name: invItem.name,
      inStock: invItem.stock > 0,
      currentStock: invItem.stock,
      price: invItem.price
    };
    setMedicines(newMeds);
    toast.success(`Swapped with ${invItem.name}`);
  };

  const removeRow = (index) => {
    const newMeds = medicines.filter((_, i) => i !== index);
    setMedicines(newMeds);
  };

  const addRow = () => {
    setMedicines([...medicines, { 
      name: '', dosage: '', timing: '', duration: '', quantity: 1, instructions: '', 
      medicineId: null, inStock: false, currentStock: 0, price: 0 
    }]);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
        <thead className="bg-teal-50 text-teal-800">
          <tr>
            <th className="p-3">Medicine Name</th>
            <th className="p-3">Dosage</th>
            <th className="p-3">Timing</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Instructions</th>
            <th className="p-3">Stock Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="p-2 min-w-[200px]">
                <input 
                  className={`w-full p-2 border rounded ${!med.medicineId ? 'border-red-400 bg-red-50' : ''}`}
                  value={med.name}
                  onChange={(e) => handleChange(idx, 'name', e.target.value)}
                  placeholder="Medicine name"
                />
              </td>
              <td className="p-2"><input className="w-full p-2 border rounded" value={med.dosage || ''} onChange={(e) => handleChange(idx, 'dosage', e.target.value)} placeholder="e.g. 500mg" /></td>
              <td className="p-2"><input className="w-full p-2 border rounded" value={med.timing || ''} onChange={(e) => handleChange(idx, 'timing', e.target.value)} placeholder="1-0-1" /></td>
              <td className="p-2"><input className="w-full p-2 border rounded" value={med.duration || ''} onChange={(e) => handleChange(idx, 'duration', e.target.value)} placeholder="5 days" /></td>
              <td className="p-2"><input className="p-2 border rounded text-center w-16" type="number" value={med.quantity || 1} onChange={(e) => handleChange(idx, 'quantity', Number(e.target.value))} /></td>
              <td className="p-2"><input className="w-full p-2 border rounded" value={med.instructions || ''} onChange={(e) => handleChange(idx, 'instructions', e.target.value)} placeholder="After food" /></td>
              <td className="p-2 min-w-[150px]">
                {med.medicineId ? (
                  med.inStock && med.currentStock >= med.quantity ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">✅ {med.currentStock} in stock</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-red-600 font-bold flex items-center gap-1">⚠️ Low ({med.currentStock})</span>
                      <select 
                        className="text-xs p-1 border rounded bg-white w-full"
                        onChange={(e) => {
                          if(e.target.value) {
                            const invMed = inventory.find(i => i._id === e.target.value);
                            handleAlternativeSelect(idx, invMed);
                          }
                        }}
                        value=""
                      >
                        <option value="" disabled>Pick alternative...</option>
                        {inventory.map(inv => (
                           <option key={inv._id} value={inv._id}>{inv.name} (₹{inv.price}) - Stock: {inv.stock}</option>
                        ))}
                      </select>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-1">
                     <span className="text-red-600 font-bold text-xs">Unmatched</span>
                     <select 
                        className="text-xs p-1 border rounded bg-white w-full border-red-400"
                        onChange={(e) => {
                          if(e.target.value) {
                            const invMed = inventory.find(i => i._id === e.target.value);
                            handleAlternativeSelect(idx, invMed);
                          }
                        }}
                        value=""
                      >
                        <option value="" disabled>Match from inventory...</option>
                        {inventory.map(inv => (
                           <option key={inv._id} value={inv._id}>{inv.name} (₹{inv.price})</option>
                        ))}
                      </select>
                  </div>
                )}
              </td>
              <td className="p-2 text-center">
                <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700 font-bold text-xl px-2">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <button onClick={addRow} className="text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded font-semibold hover:bg-teal-200">+ Add Row</button>
      </div>
    </div>
  );
}
