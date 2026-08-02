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
    toast.success(`Matched with ${invItem.name}`);
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
    <div className="w-full space-y-4">
      {/* Mobile Card View (< 768px) */}
      <div className="block md:hidden space-y-4">
        {medicines.map((med, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm relative space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-teal-800 text-sm">Item #{idx + 1}</span>
              <button 
                onClick={() => removeRow(idx)} 
                className="text-red-500 hover:text-red-700 bg-red-50 p-1 px-2.5 rounded-full text-xs font-bold"
              >
                🗑️ Delete
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine Name</label>
              <input 
                className={`w-full p-2.5 text-sm border rounded-lg ${!med.medicineId ? 'border-red-400 bg-red-50' : 'bg-white'}`}
                value={med.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                placeholder="e.g. Paracetamol"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Dosage</label>
                <input 
                  className="w-full p-2 text-sm border rounded-lg bg-white" 
                  value={med.dosage || ''} 
                  onChange={(e) => handleChange(idx, 'dosage', e.target.value)} 
                  placeholder="500mg" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Timing</label>
                <input 
                  className="w-full p-2 text-sm border rounded-lg bg-white" 
                  value={med.timing || ''} 
                  onChange={(e) => handleChange(idx, 'timing', e.target.value)} 
                  placeholder="1-0-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                <input 
                  className="w-full p-2 text-sm border rounded-lg bg-white" 
                  value={med.duration || ''} 
                  onChange={(e) => handleChange(idx, 'duration', e.target.value)} 
                  placeholder="5 days" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                <input 
                  className="w-full p-2 text-sm border rounded-lg bg-white font-bold text-center" 
                  type="number" 
                  value={med.quantity || 1} 
                  onChange={(e) => handleChange(idx, 'quantity', Number(e.target.value))} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Instructions</label>
              <input 
                className="w-full p-2 text-sm border rounded-lg bg-white" 
                value={med.instructions || ''} 
                onChange={(e) => handleChange(idx, 'instructions', e.target.value)} 
                placeholder="After food" 
              />
            </div>

            <div className="pt-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Status</label>
              {med.medicineId ? (
                med.inStock && med.currentStock >= med.quantity ? (
                  <span className="text-green-700 font-bold text-xs bg-green-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                    ✅ {med.currentStock} in stock (₹{med.price})
                  </span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                      ⚠️ Low Stock ({med.currentStock})
                    </span>
                    <select 
                      className="text-xs p-2 border rounded-lg bg-white w-full"
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
                        <option key={inv._id} value={inv._id}>{inv.name} (₹{inv.price}) - Stock: {inv.stock}</option>
                      ))}
                    </select>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                    ❓ Unmatched Item
                  </span>
                  <select 
                    className="text-xs p-2 border rounded-lg bg-white w-full border-red-400"
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
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
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
                <td className="p-2 min-w-[180px]">
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
      </div>

      <div className="mt-3">
        <button 
          onClick={addRow} 
          className="w-full sm:w-auto text-sm bg-teal-600 text-white px-4 py-2.5 rounded-lg font-bold shadow hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-1"
        >
          ➕ Add Medicine Row
        </button>
      </div>
    </div>
  );
}
