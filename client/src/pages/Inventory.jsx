import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '', expiryDate: '' });
  const [editingId, setEditingId] = useState(null);
  const { clinic } = useAuth();

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
    } catch {
      toast.error("Failed to load inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/inventory/${editingId}`, formData);
        toast.success("Item updated");
      } else {
        await axios.post('/api/inventory', formData);
        toast.success("Item added");
      }
      setFormData({ name: '', category: '', price: '', stock: '', expiryDate: '' });
      setEditingId(null);
      fetchInventory();
    } catch {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await axios.delete(`/api/inventory/${id}`);
      toast.success("Item deleted");
      fetchInventory();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      category: item.category || '',
      price: item.price,
      stock: item.stock,
      expiryDate: item.expiryDate ? item.expiryDate.substring(0, 10) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLowStock = (stock) => stock < (clinic?.lowStockThreshold || 10);

  return (
    <div className="max-w-6xl mx-auto mt-2 sm:mt-4 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-teal-800">Inventory Management</h2>

      {/* Form */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-t-4 border-blue-500">
        <h3 className="text-base sm:text-lg font-bold mb-4">{editingId ? '✏️ Edit Medicine' : '➕ Add New Medicine'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Medicine Name</label>
            <input 
              type="text" required className="w-full mt-1 p-2.5 sm:p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. Paracetamol"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Category</label>
            <input 
              type="text" className="w-full mt-1 p-2.5 sm:p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Tablet, Syrup" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Price (₹)</label>
            <input 
              type="number" step="0.01" required className="w-full mt-1 p-2.5 sm:p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Stock Qty</label>
            <input 
              type="number" required className="w-full mt-1 p-2.5 sm:p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 h-[42px] transition-all text-sm">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({name: '', category: '', price: '', stock: '', expiryDate: ''}); }} 
                className="bg-gray-300 text-gray-700 px-3 rounded-lg font-bold h-[42px] text-sm active:scale-95 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {inventory.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500 italic">No medicines in inventory.</div>
        )}
        {inventory.map((item) => (
          <div key={item._id} className={`p-4 rounded-xl shadow-md border ${isLowStock(item.stock) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'} space-y-2`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.category || 'General'}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${isLowStock(item.stock) ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                Stock: {item.stock}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-bold text-teal-700 text-sm">₹{item.price.toFixed(2)}</span>
              <div className="flex gap-4">
                <button onClick={() => handleEdit(item)} className="text-blue-600 font-semibold text-xs border border-blue-200 px-3 py-1 rounded-lg bg-blue-50">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="text-red-600 font-semibold text-xs border border-red-200 px-3 py-1 rounded-lg bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 && (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500 italic">No medicines in inventory.</td></tr>
            )}
            {inventory.map((item) => (
              <tr key={item._id} className={`border-b hover:bg-gray-50 ${isLowStock(item.stock) ? 'bg-red-50' : ''}`}>
                <td className="p-4 font-semibold">{item.name}</td>
                <td className="p-4 text-gray-600">{item.category}</td>
                <td className="p-4">₹{item.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold ${isLowStock(item.stock) ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.stock}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline mr-3 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
