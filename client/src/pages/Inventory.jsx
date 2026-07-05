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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await axios.delete(`/api/inventory/${id}`);
      toast.success("Item deleted");
      fetchInventory();
    } catch (err) {
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
  };

  const isLowStock = (stock) => stock < (clinic?.lowStockThreshold || 10);

  return (
    <div className="max-w-6xl mx-auto mt-4">
      <h2 className="text-2xl font-bold text-teal-800 mb-6">Inventory Management</h2>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-blue-500">
        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Medicine Name</label>
            <input type="text" required className="w-full mt-1 p-2 border rounded" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Category</label>
            <input type="text" className="w-full mt-1 p-2 border rounded" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Tablet, Syrup" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Price (₹)</label>
            <input type="number" required className="w-full mt-1 p-2 border rounded" 
              value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Stock Qty</label>
            <input type="number" required className="w-full mt-1 p-2 border rounded" 
              value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 h-[42px]">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({name: '', category: '', price: '', stock: '', expiryDate: ''}); }} 
                      className="bg-gray-300 px-3 rounded font-bold h-[42px]">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                  <span className={`px-2 py-1 rounded font-bold ${isLowStock(item.stock) ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.stock}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
