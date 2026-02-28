'use client';

import { useState, useEffect, FormEvent } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('mechanic');
  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    stock_quantity: '',
    cost_price: '',
    selling_price: '',
    minimum_stock_level: '',
    supplier_name: '',
    supplier_phone: '',
    is_on_credit: false,
    credit_amount: '',
  });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString()}`;
  };

  const fetchInventory = async () => {
    try {
      const data = await api.inventory.list();
      setInventory(data.results || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'mechanic');
      } catch (e) {
        setUserRole('mechanic');
      }
    }

    fetchInventory();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const itemData = {
        ...itemForm,
        stock_quantity: Number(itemForm.stock_quantity),
        cost_price: Number(itemForm.cost_price),
        selling_price: Number(itemForm.selling_price),
        minimum_stock_level: Number(itemForm.minimum_stock_level || 0),
        credit_amount: itemForm.is_on_credit ? Number(itemForm.credit_amount) : null,
      };

      if (editingItemId) {
        await api.inventory.update(editingItemId, itemData);
      } else {
        await api.inventory.create(itemData);
      }

      setShowForm(false);
      setEditingItemId(null);
      setItemForm({
        name: '',
        category: '',
        stock_quantity: '',
        cost_price: '',
        selling_price: '',
        minimum_stock_level: '',
        supplier_name: '',
        supplier_phone: '',
        is_on_credit: false,
        credit_amount: '',
      });
      await fetchInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingItemId ? 'update' : 'add'} item`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setItemForm({
      name: item.name,
      category: item.category,
      stock_quantity: item.stock_quantity.toString(),
      cost_price: item.cost_price.toString(),
      selling_price: item.selling_price.toString(),
      minimum_stock_level: (item.low_stock_threshold || item.minimum_stock_level || '').toString(),
      supplier_name: item.supplier_name || '',
      supplier_phone: item.supplier_phone || '',
      is_on_credit: item.is_on_credit || false,
      credit_amount: item.credit_amount ? item.credit_amount.toString() : '',
    });
    setEditingItemId(item.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingItemId(null);
    setItemForm({
      name: '',
      category: '',
      stock_quantity: '',
      cost_price: '',
      selling_price: '',
      minimum_stock_level: '',
      supplier_name: '',
      supplier_phone: '',
      is_on_credit: false,
      credit_amount: '',
    });
  };

  const fillDummyData = () => {
    const parts = [
      'Oil Filter', 'Air Filter', 'Fuel Filter', 'Spark Plug', 'Brake Pad',
      'Brake Disc', 'Clutch Plate', 'Timing Belt', 'Fan Belt', 'Alternator',
      'Starter Motor', 'Radiator', 'Water Pump', 'Fuel Pump', 'Shock Absorber',
      'Control Arm', 'Tie Rod End', 'Ball Joint', 'CV Joint', 'Wheel Bearing',
      'Engine Oil', 'Transmission Oil', 'Coolant', 'Brake Fluid', 'Power Steering Fluid'
    ];
    
    const categories = [
      'engine', 'electrical', 'body', 'suspension', 'brakes',
      'cooling', 'fuel', 'transmission', 'other'
    ];

    const suppliers = [
      { name: 'AutoParts Ghana Ltd', phone: '0302 123456' },
      { name: 'Motors & Components', phone: '0244 789012' },
      { name: 'OEM Direct Supplies', phone: '0243 456789' },
      { name: 'Quality Auto Parts', phone: '0501 234567' },
      { name: 'Mechanical Trade Center', phone: '0555 789012' },
      { name: 'Express Auto Suppliers', phone: '0202 345678' },
    ];

    const randomPart = parts[Math.floor(Math.random() * parts.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const costPrice = (Math.random() * 500 + 50).toFixed(2);
    const markup = Math.random() * 0.5 + 0.2; // 20% to 70% markup
    const sellingPrice = (parseFloat(costPrice) * (1 + markup)).toFixed(2);
    const stockQty = Math.floor(Math.random() * 100) + 10;
    const minStock = Math.floor(Math.random() * 10) + 5;
    const isOnCredit = Math.random() > 0.6; // 40% chance of being on credit
    const creditAmount = isOnCredit ? (parseFloat(costPrice) * Math.floor(Math.random() * 20 + 5)).toFixed(2) : '';

    setItemForm({
      name: randomPart,
      category: randomCategory,
      stock_quantity: stockQty.toString(),
      cost_price: costPrice,
      selling_price: sellingPrice,
      minimum_stock_level: minStock.toString(),
      supplier_name: randomSupplier.name,
      supplier_phone: randomSupplier.phone,
      is_on_credit: isOnCredit,
      credit_amount: creditAmount,
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading inventory...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <button 
            onClick={() => {
              handleCancelEdit();
              setShowForm(!showForm);
            }}
            className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <div className="dashboard-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-800">{editingItemId ? '  Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button
                type="button"
                onClick={fillDummyData}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                🎲 Fill Dummy Data
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="engine">Engine</option>
                    <option value="electrical">Electrical</option>
                    <option value="body">Body</option>
                    <option value="suspension">Suspension</option>
                    <option value="brakes">Brakes</option>
                    <option value="cooling">Cooling</option>
                    <option value="fuel">Fuel</option>
                    <option value="transmission">Transmission</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.stock_quantity}
                    onChange={(e) => setItemForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.minimum_stock_level}
                    onChange={(e) => setItemForm(prev => ({ ...prev, minimum_stock_level: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    placeholder="Alert when stock falls below"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cost Price (₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.cost_price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, cost_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price (₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.selling_price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, selling_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={itemForm.supplier_name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    placeholder="e.g., AutoParts Ghana Ltd"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Phone</label>
                  <input
                    type="tel"
                    value={itemForm.supplier_phone}
                    onChange={(e) => setItemForm(prev => ({ ...prev, supplier_phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    placeholder="e.g., 0302 123456"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={itemForm.is_on_credit}
                      onChange={(e) => setItemForm(prev => ({ ...prev, is_on_credit: e.target.checked }))}
                      className="w-4 h-4 border border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Purchased on Credit</span>
                  </label>
                </div>
                {itemForm.is_on_credit && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Credit Amount (₵)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.credit_amount}
                      onChange={(e) => setItemForm(prev => ({ ...prev, credit_amount: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                      placeholder="Amount owed to supplier"
                      required={itemForm.is_on_credit}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
                >
                  {submitting ? (editingItemId ? 'Updating...' : 'Adding...') : (editingItemId ? 'Update Item' : 'Add Item')}
                </button>
                <button
                  type="button"
                  onClick={fillDummyData}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
                >
                  🎲 Fill with Dummy Data
                </button>
              </div>
            </form>
          </div>
        )}

        {inventory.length === 0 ? (
          <div className="dashboard-section p-8 text-center text-gray-600">
            No inventory items yet
          </div>
        ) : (
          <div className="dashboard-table">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Price</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Credit</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${item.is_on_credit ? 'bg-primary-50' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-medium">{item.name}</td>
                    <td className="px-4 py-2.5 capitalize">{item.category_display || item.category || 'General'}</td>
                    <td className="px-4 py-2.5">
                      <span className={item.stock_quantity < (item.low_stock_threshold || item.minimum_stock_level || 10) ? 'text-primary-600 font-bold' : 'text-gray-800'}>
                        {item.stock_quantity}
                        {item.stock_quantity < (item.low_stock_threshold || item.minimum_stock_level || 10) && ' ⚠️'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{formatCedi(item.cost_price)}</td>
                    <td className="px-4 py-2.5">
                      {item.supplier_name ? (
                        <button
                          onClick={() => {
                            setSelectedSupplier(item);
                            setShowSupplierModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer text-sm"
                        >
                          {item.supplier_name}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {item.is_on_credit ? (
                        <span className="text-primary-600 font-semibold text-sm">{formatCedi(item.remaining_credit || item.credit_amount)}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-3 py-1 text-xs font-medium rounded-lg"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier Details Modal */}
      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Supplier Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Item</label>
                <p className="text-gray-800 font-semibold">{selectedSupplier.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Supplier</label>
                <p className="text-gray-800">{selectedSupplier.supplier_name || 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-800">{selectedSupplier.supplier_phone || 'Not set'}</p>
              </div>
              
              {selectedSupplier.is_on_credit && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-600 mb-3">Credit Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Credit Amount</label>
                        <p className="text-lg font-semibold text-primary-600">{formatCedi(selectedSupplier.credit_amount)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Amount Paid</label>
                        <p className="text-lg font-semibold text-gray-800">{formatCedi(selectedSupplier.amount_paid || 0)}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500">Remaining Balance</label>
                        <p className="text-base font-bold text-primary-600">{formatCedi(selectedSupplier.remaining_credit || selectedSupplier.credit_amount)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSupplierModal(false);
                  setSelectedSupplier(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedSupplier);
                  setShowSupplierModal(false);
                  setSelectedSupplier(null);
                }}
                className="flex-1 bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 py-2 px-4 rounded-lg font-medium"
              >
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


