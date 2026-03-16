'use client';

import { useState, useEffect, FormEvent } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SearchableSelect from '@/components/SearchableSelect';
import { api } from '@/lib/brooks-api';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'supplier' | 'stock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [addStockForm, setAddStockForm] = useState({
    inventory_item: '',
    quantity: '',
    cost_price: '',
    selling_price: '',
    supplier_name: '',
    supplier_phone: '',
    is_on_credit: false,
    credit_amount: '',
    amount_paid: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [addStockSubmitting, setAddStockSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('mechanic');
  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    stock_quantity: '',
    cost_price: '',
    selling_price: '',
    low_stock_threshold: '',
    supplier_name: '',
    supplier_phone: '',
    is_on_credit: false,
    credit_amount: '',
    amount_paid: '',
    is_customer_provided: false,
    assign_car_id: '',
    assign_quantity: '1',
  });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [partsOptions, setPartsOptions] = useState<{value:string;label?:string}[]>([]);

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

    const bootstrap = async () => {
      await fetchInventory();
      try {
        const carData = await api.cars.list();
        setCars(carData?.results || carData || []);
      } catch {
        setCars([]);
      }
    };

    bootstrap();
    const loadPartsCatalog = async () => {
      const getNextPage = (nextUrl?: string | null) => {
        if (!nextUrl) return null;
        try {
          const parsed = new URL(nextUrl);
          const page = parsed.searchParams.get('page');
          return page ? Number(page) : null;
        } catch {
          return null;
        }
      };

      try {
        const allParts: any[] = [];
        let page = 1;
        let hasNext = true;

        while (hasNext) {
          const partsResponse = await api.inventoryParts.list({ page });
          const pageItems = partsResponse?.results || partsResponse || [];
          if (Array.isArray(pageItems)) {
            allParts.push(...pageItems);
          }

          const nextPage = getNextPage(partsResponse?.next);
          if (!nextPage || nextPage === page) {
            hasNext = false;
          } else {
            page = nextPage;
          }
        }

        const parts = allParts;
        if (Array.isArray(parts) && parts.length > 0) {
          setPartsOptions(parts.map((p: any) => ({ value: p.name || p.value || '', label: p.name || p.value || '' })).filter((p: any) => p.value));
          return;
        }
      } catch {
        // fallback below
      }

      fetch('/data/parts.json').then(r => r.json()).then((list) => {
        setPartsOptions((list || []).map((p: string) => ({ value: p, label: p })));
      }).catch(() => setPartsOptions([]));
    };

    loadPartsCatalog();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const selectedCar = cars.find((car) => String(car.id) === String(itemForm.assign_car_id));
      const selectedCustomerName = String(selectedCar?.customer_name || '').trim();
      const creditAmount = Number(itemForm.credit_amount || 0);
      const amountPaid = Number(itemForm.amount_paid || 0);

      if (!editingItemId && itemForm.is_customer_provided && !itemForm.assign_car_id) {
        setError('Select a car for customer-provided item assignment.');
        return;
      }

      if (!editingItemId && itemForm.is_customer_provided && !selectedCustomerName) {
        setError('Selected car does not have a customer name.');
        return;
      }

      if (itemForm.is_on_credit && amountPaid > creditAmount) {
        setError('Amount paid cannot exceed credit amount.');
        return;
      }

      const itemData = {
        name: itemForm.name,
        category: itemForm.category,
        supplier_name: itemForm.is_customer_provided ? selectedCustomerName : itemForm.supplier_name,
        supplier_phone: itemForm.is_customer_provided ? '' : itemForm.supplier_phone,
        stock_quantity: Number(itemForm.stock_quantity),
        cost_price: itemForm.is_customer_provided ? 0 : Number(itemForm.cost_price),
        selling_price: itemForm.is_customer_provided ? 0 : Number(itemForm.selling_price),
        low_stock_threshold: Number(itemForm.low_stock_threshold || 0),
        is_on_credit: itemForm.is_customer_provided ? false : itemForm.is_on_credit,
        credit_amount: itemForm.is_customer_provided ? 0 : (itemForm.is_on_credit ? creditAmount : 0),
        amount_paid: itemForm.is_customer_provided ? 0 : (itemForm.is_on_credit ? amountPaid : 0),
      };

      let createdOrUpdated: any;
      if (editingItemId) {
        createdOrUpdated = await api.inventory.update(editingItemId, itemData);
      } else {
        createdOrUpdated = await api.inventory.create(itemData);
      }

      if (!editingItemId && itemForm.is_customer_provided && itemForm.assign_car_id) {
        await api.carInventory.create({
          car: itemForm.assign_car_id,
          inventory_item: createdOrUpdated?.id,
          quantity: Number(itemForm.assign_quantity || 1),
          cost_price: 0,
          selling_price: 0,
          is_customer_provided: true,
        });
      }

      setShowForm(false);
      setEditingItemId(null);
      setItemForm({
        name: '',
        category: '',
        stock_quantity: '',
        cost_price: '',
        selling_price: '',
        low_stock_threshold: '',
        supplier_name: '',
        supplier_phone: '',
        is_on_credit: false,
        credit_amount: '',
        amount_paid: '',
        is_customer_provided: false,
        assign_car_id: '',
        assign_quantity: '1',
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
      low_stock_threshold: (item.low_stock_threshold || item.minimum_stock_level || '').toString(),
      supplier_name: item.supplier_name || '',
      supplier_phone: item.supplier_phone || '',
      is_on_credit: item.is_on_credit || false,
      credit_amount: item.credit_amount ? item.credit_amount.toString() : '',
      amount_paid: item.amount_paid ? item.amount_paid.toString() : '',
      is_customer_provided: false,
      assign_car_id: '',
      assign_quantity: '1',
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
      low_stock_threshold: '',
      supplier_name: '',
      supplier_phone: '',
      is_on_credit: false,
      credit_amount: '',
      amount_paid: '',
      is_customer_provided: false,
      assign_car_id: '',
      assign_quantity: '1',
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
      low_stock_threshold: minStock.toString(),
      supplier_name: randomSupplier.name,
      supplier_phone: randomSupplier.phone,
      is_on_credit: isOnCredit,
      credit_amount: creditAmount,
      amount_paid: isOnCredit ? '0' : '',
      is_customer_provided: false,
      assign_car_id: '',
      assign_quantity: '1',
    });
  };

  const filteredInventory = inventory.filter((item: any) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      String(item.name || '').toLowerCase().includes(query) ||
      String(item.category_display || item.category || '').toLowerCase().includes(query) ||
      String(item.supplier_name || '').toLowerCase().includes(query)
    );
  });

  const sortedInventory = [...filteredInventory].sort((a: any, b: any) => {
    const dir = sortDir === 'asc' ? 1 : -1;

    if (sortBy === 'stock') {
      return (Number(a.stock_quantity || 0) - Number(b.stock_quantity || 0)) * dir;
    }

    if (sortBy === 'supplier') {
      return String(a.supplier_name || '').localeCompare(String(b.supplier_name || '')) * dir;
    }

    if (sortBy === 'category') {
      const aCategory = String(a.category_display || a.category || '');
      const bCategory = String(b.category_display || b.category || '');
      return aCategory.localeCompare(bCategory) * dir;
    }

    return String(a.name || '').localeCompare(String(b.name || '')) * dir;
  });

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            placeholder="Search item name, category, supplier"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'supplier' | 'stock')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="name">Sort by Item Name</option>
            <option value="category">Sort by Category</option>
            <option value="supplier">Sort by Supplier</option>
            <option value="stock">Sort by Stock</option>
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setShowAddStockModal(true)}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Add to stock
          </button>
          <button 
            onClick={() => {
              handleCancelEdit();
              setShowForm(!showForm);
            }}
            className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? 'Cancel' : 'New inventory item'}
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
              <h3 className="text-base font-bold text-gray-800">{editingItemId ? 'Edit Inventory Item' : 'New inventory item'}</h3>
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
                  <SearchableSelect
                    value={itemForm.name}
                    onChange={(v) => setItemForm(prev => ({ ...prev, name: v }))}
                    options={partsOptions}
                    placeholder="Start typing or select a part"
                    allowFreeText={true}
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
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
                    value={itemForm.low_stock_threshold}
                    onChange={(e) => setItemForm(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    placeholder="Alert when stock falls below"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={itemForm.is_customer_provided}
                      onChange={(e) => setItemForm(prev => ({
                        ...prev,
                        is_customer_provided: e.target.checked,
                        supplier_name: e.target.checked ? '' : prev.supplier_name,
                        supplier_phone: e.target.checked ? '' : prev.supplier_phone,
                        is_on_credit: e.target.checked ? false : prev.is_on_credit,
                        credit_amount: e.target.checked ? '' : prev.credit_amount,
                        amount_paid: e.target.checked ? '' : prev.amount_paid,
                        cost_price: e.target.checked ? '0' : prev.cost_price,
                        selling_price: e.target.checked ? '0' : prev.selling_price,
                      }))}
                      className="w-4 h-4 border border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Customer-provided item</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cost per unit  (₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.cost_price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, cost_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                    required
                    disabled={itemForm.is_customer_provided}
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
                    disabled={itemForm.is_customer_provided}
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
                    disabled={itemForm.is_customer_provided}
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
                    disabled={itemForm.is_customer_provided}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={itemForm.is_on_credit}
                      onChange={(e) => setItemForm(prev => ({ ...prev, is_on_credit: e.target.checked }))}
                      className="w-4 h-4 border border-gray-300 rounded"
                      disabled={itemForm.is_customer_provided}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Purchased on Credit</span>
                  </label>
                </div>
                {itemForm.is_on_credit && (
                  <>
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
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (₵)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.amount_paid}
                        onChange={(e) => setItemForm(prev => ({ ...prev, amount_paid: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none"
                        placeholder="Optional partial payment"
                      />
                    </div>
                  </>
                )}
                {itemForm.is_customer_provided && !editingItemId && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Assign to Car Now</label>
                      <select
                        value={itemForm.assign_car_id}
                        onChange={(e) => setItemForm(prev => ({ ...prev, assign_car_id: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <option value="">Select car (optional)</option>
                        {cars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.number_plate} - {car.customer_name || car.make || 'Car'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Assignment Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={itemForm.assign_quantity}
                        onChange={(e) => setItemForm(prev => ({ ...prev, assign_quantity: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  </>
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

        {/* Add to stock modal */}
        {showAddStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4">Add to stock</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Inventory Item</label>
                  <select
                    value={addStockForm.inventory_item}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, inventory_item: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="">Select item</option>
                    {inventory.map(it => (
                      <option key={it.id} value={it.id}>{it.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity to add</label>
                  <input
                    type="number"
                    min="1"
                    value={addStockForm.quantity}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cost per unit (₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addStockForm.cost_price}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, cost_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addStockForm.selling_price}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, selling_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={addStockForm.supplier_name}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Phone</label>
                  <input
                    type="text"
                    value={addStockForm.supplier_phone}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, supplier_phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={addStockForm.is_on_credit}
                      onChange={(e) => setAddStockForm(prev => ({ ...prev, is_on_credit: e.target.checked }))}
                      className="w-4 h-4 border border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Purchased on Credit</span>
                  </label>
                </div>
                {addStockForm.is_on_credit && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Credit Amount (₵)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addStockForm.credit_amount}
                        onChange={(e) => setAddStockForm(prev => ({ ...prev, credit_amount: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (₵)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addStockForm.amount_paid}
                        onChange={(e) => setAddStockForm(prev => ({ ...prev, amount_paid: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={async () => {
                      if (!addStockForm.inventory_item) return;
                      if (addStockForm.is_on_credit && Number(addStockForm.amount_paid || 0) > Number(addStockForm.credit_amount || 0)) {
                        setError('Amount paid cannot exceed credit amount.');
                        return;
                      }

                      setAddStockSubmitting(true);
                      try {
                        // Try backend add_stock endpoint first
                        await api.inventory.addStock(addStockForm.inventory_item, {
                          quantity: Number(addStockForm.quantity || 0),
                          cost_price: addStockForm.cost_price ? Number(addStockForm.cost_price) : undefined,
                          selling_price: addStockForm.selling_price ? Number(addStockForm.selling_price) : undefined,
                          supplier_name: addStockForm.supplier_name || undefined,
                          supplier_phone: addStockForm.supplier_phone || undefined,
                          is_on_credit: addStockForm.is_on_credit,
                          credit_amount: addStockForm.is_on_credit ? Number(addStockForm.credit_amount || 0) : 0,
                          amount_paid: addStockForm.is_on_credit ? Number(addStockForm.amount_paid || 0) : 0,
                        });
                      } catch (err) {
                        // Fallback: fetch the item and patch stock_quantity
                        try {
                          const item = await api.inventory.get(addStockForm.inventory_item);
                          const newQty = (Number(item.stock_quantity || 0) + Number(addStockForm.quantity || 0));
                          const patch: any = { stock_quantity: newQty };
                          if (addStockForm.selling_price) patch.selling_price = Number(addStockForm.selling_price);
                          await api.inventory.update(addStockForm.inventory_item, patch);
                        } catch (err2) {
                          console.error('Failed to add to stock', err2);
                        }
                      }
                      // refresh
                      await fetchInventory();
                      setShowAddStockModal(false);
                      setAddStockForm({
                        inventory_item: '', quantity: '', cost_price: '', selling_price: '',
                        supplier_name: '', supplier_phone: '', is_on_credit: false, credit_amount: '', amount_paid: ''
                      });
                      setAddStockSubmitting(false);
                    }}
                    disabled={addStockSubmitting}
                    className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {addStockSubmitting ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={() => setShowAddStockModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sortedInventory.length === 0 ? (
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
                {sortedInventory.map((item: any) => (
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
                      <div className="text-xs text-gray-500">Min: {item.low_stock_threshold || item.minimum_stock_level || 0}</div>
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


