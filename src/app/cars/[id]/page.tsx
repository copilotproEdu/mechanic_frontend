'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function CarDetailPage() {
  const params = useParams();
  const carId = params.id as string;
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [userRole, setUserRole] = useState('receptionist');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDiagnosticsForm, setShowDiagnosticsForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showOutsourcedForm, setShowOutsourcedForm] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [diagnosticsForm, setDiagnosticsForm] = useState({
    description: '',
    inspector_type: 'mechanic',
  });
  const [outsourcedForm, setOutsourcedForm] = useState({
    service_name: '',
    vendor_company_name: '',
    labor_cost: '',
    parts_cost: '',
    description: '',
    pickup_date: '',
  });
  const [inventoryForm, setInventoryForm] = useState({
    inventory_item: '',
    quantity: 1,
    cost_price: '',
    selling_price: '',
    is_customer_provided: false,
  });
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    labor_cost: '',
    due_date: '',
  });
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [showPortalModal, setShowPortalModal] = useState(false);

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString()}`;
  };

  const calculatePartsCost = () => {
    if (!car?.inventory_assignments) return 0;
    return car.inventory_assignments.reduce((total: number, assignment: any) => {
      const itemTotal = Number(assignment.quantity || 0) * Number(assignment.selling_price || 0);
      return total + itemTotal;
    }, 0);
  };

  const calculateOutsourcedPartsCost = () => {
    if (!car?.outsourced_services) return 0;
    return car.outsourced_services.reduce((total: number, service: any) => {
      return total + Number(service.parts_cost || 0);
    }, 0);
  };

  const calculateOutsourcedLaborCost = () => {
    if (!car?.outsourced_services) return 0;
    return car.outsourced_services.reduce((total: number, service: any) => {
      return total + Number(service.labor_cost || 0);
    }, 0);
  };

  const handleOpenNewSession = async () => {
    // Save current session to history ONLY if there's actual data
    if (car && (diagnosticsForm.description || car.diagnostics || car.inventory_assignments?.length > 0 || car.outsourced_services?.length > 0 || car.invoice)) {
      const newSession = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        diagnostics: car.diagnostics || diagnosticsForm,
        inventory: car.inventory_assignments || [],
        outsourced: car.outsourced_services || [],
        invoice: car.invoice || null,
        reason: car.reason_for_visit,
        status: car.status,
      };
      setSessions(prev => [newSession, ...prev]);
    }

    // Delete old backend data to start fresh
    try {
      // Delete diagnostics if exists
      if (car?.diagnostics?.id) {
        // Note: Backend might not support deleting diagnostics, so we'll just clear frontend
      }
      
      // Delete all inventory assignments
      if (car?.inventory_assignments && car.inventory_assignments.length > 0) {
        await Promise.all(
          car.inventory_assignments.map((item: any) => 
            api.carInventory.delete(item.id).catch(() => {}) // Ignore errors
          )
        );
      }
      
      // Clear outsourced services (backend might not support delete)
      // Clear invoice (backend might not support delete)
    } catch (err) {
      console.error('Error clearing backend data:', err);
    }

    // Clear the car state to remove old session data
    if (car) {
      setCar({
        ...car,
        diagnostics: null,
        inventory_assignments: [],
        outsourced_services: [],
        invoice: null,
      });
    }

    // Completely clear all forms
    setDiagnosticsForm({
      description: '',
      inspector_type: 'mechanic',
    });
    setInventoryForm({
      inventory_item: '',
      quantity: 1,
      cost_price: '',
      selling_price: '',
      is_customer_provided: false,
    });
    setOutsourcedForm({
      service_name: '',
      vendor_company_name: '',
      labor_cost: '',
      parts_cost: '',
      description: '',
      pickup_date: '',
    });
    setInvoiceForm({
      invoice_number: '',
      labor_cost: '',
      due_date: '',
    });
    setShowDiagnosticsForm(false);
    setShowInventoryForm(false);
    setShowInvoiceForm(false);
    setShowOutsourcedForm(false);
    setCurrentSessionId(null);
    setShowNewSessionModal(true);
  };

  const handleViewSessionDetails = (session: any) => {
    // Load selected session into car state
    setCurrentSessionId(session.id);
    
    // Restore car state with session data
    if (car) {
      setCar({
        ...car,
        diagnostics: session.diagnostics || null,
        inventory_assignments: session.inventory || [],
        outsourced_services: session.outsourced || [],
        invoice: session.invoice || null,
        reason_for_visit: session.reason,
        status: session.status,
      });
    }

    // Restore form states
    setDiagnosticsForm(session.diagnostics || { description: '', inspector_type: 'mechanic' });
    setInvoiceForm(session.invoice ? 
      {
        invoice_number: session.invoice.invoice_number || '',
        labor_cost: String(session.invoice.labor_cost || ''),
        due_date: session.invoice.due_date || '',
      }
      : { invoice_number: '', labor_cost: '', due_date: '' });
    setActiveTab('info');
  };

  const handleReturnToLive = async () => {
    setCurrentSessionId(null);
    // Refresh car data from backend
    await refreshCar();
    setActiveTab('info');
  };

  const refreshCar = async () => {
    const data = await api.cars.get(carId);
    setCar(data);
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    setActionError('');
    try {
      await api.cars.update(carId, { status: newStatus });
      await refreshCar();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleGeneratePortalToken = async () => {
    setActionError('');
    try {
      const response = await api.cars.generatePortalToken(carId);
      setPortalToken(response.token);
      setShowPortalModal(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to generate portal link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Portal link copied to clipboard!');
  };

  const fetchInventoryItems = async () => {
    if (loadingInventoryItems) return;
    setLoadingInventoryItems(true);
    try {
      const data = await api.inventory.list();
      const items = Array.isArray(data) ? data : data?.results || [];
      setInventoryItems(items);
    } finally {
      setLoadingInventoryItems(false);
    }
  };

  const handleCreateDiagnostics = async (event: FormEvent) => {
    event.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      const diagnosticsData = {
        description: diagnosticsForm.description,
        inspector_type: diagnosticsForm.inspector_type,
      };
      
      let diagnosticsResult;
      if (car?.diagnostics?.id) {
        diagnosticsResult = await api.diagnostics.update(car.diagnostics.id, diagnosticsData);
      } else {
        diagnosticsResult = await api.diagnostics.create(carId, diagnosticsData);
      }
      
      // Update local car state instead of refreshing from backend
      if (car) {
        setCar({
          ...car,
          diagnostics: diagnosticsResult || { ...diagnosticsData, id: car.diagnostics?.id }
        });
      }
      setShowDiagnosticsForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save diagnostics');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignInventory = async (event: FormEvent) => {
    event.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      if (!inventoryForm.inventory_item) {
        setActionError('Select an inventory item');
        return;
      }

      const newAssignment = await api.carInventory.create({
        car: carId,
        inventory_item: inventoryForm.inventory_item,
        quantity: Number(inventoryForm.quantity || 1),
        cost_price: Number(inventoryForm.cost_price || 0),
        selling_price: Number(inventoryForm.selling_price || 0),
        is_customer_provided: inventoryForm.is_customer_provided,
      });

      // Update local car state instead of refreshing from backend
      if (car) {
        setCar({
          ...car,
          inventory_assignments: [...(car.inventory_assignments || []), newAssignment]
        });
      }
      setShowInventoryForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to assign inventory');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvoice = async (event: FormEvent) => {
    event.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      const partsCost = calculatePartsCost();
      const outsourcedPartsCost = calculateOutsourcedPartsCost();
      const outsourcedLaborCost = calculateOutsourcedLaborCost();
      const outsourcedTotal = outsourcedPartsCost + outsourcedLaborCost;

      const newInvoice = await api.invoices.create({
        car: carId,
        invoice_number: invoiceForm.invoice_number,
        parts_cost: partsCost,
        labor_cost: Number(invoiceForm.labor_cost || 0),
        outsourced_cost: outsourcedTotal,
        tax_percentage: 0,
        due_date: invoiceForm.due_date || null,
      });

      // Update local car state instead of refreshing from backend
      if (car) {
        setCar({
          ...car,
          invoice: newInvoice
        });
      }
      setShowInvoiceForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOutsourcedService = async (event: FormEvent) => {
    event.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      const newService = await api.outsourcedServices.create({
        car: carId,
        service_name: outsourcedForm.service_name,
        vendor_company_name: outsourcedForm.vendor_company_name,
        labor_cost: Number(outsourcedForm.labor_cost || 0),
        parts_cost: Number(outsourcedForm.parts_cost || 0),
        description: outsourcedForm.description,
        pickup_date: outsourcedForm.pickup_date || null,
      });

      // Update local car state instead of refreshing from backend
      if (car) {
        setCar({
          ...car,
          outsourced_services: [...(car.outsourced_services || []), newService]
        });
      }
      setShowOutsourcedForm(false);
      setOutsourcedForm({
        service_name: '',
        vendor_company_name: '',
        labor_cost: '',
        parts_cost: '',
        description: '',
        pickup_date: '',
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create outsourced service');
    } finally {
      setActionLoading(false);
    }
  };

  const fillOutsourcedDummyData = () => {
    const services = [
      'Body Spray Painting',
      'Welding Service',
      'Upholstery Work',
      'Window Tinting',
      'AC Recharge',
      'Electrical Diagnostics',
      'Panel Beating',
      'Custom Fabrication'
    ];
    const companies = [
      'Express Auto Works',
      'Pro Paint Solutions',
      'Elite Body Shop',
      'Quick Fix Welders',
      'Master Craftsmen Ltd',
      'AutoCare Specialists',
      'Golden Touch Services'
    ];
    const descriptions = [
      'Full body respray with premium paint',
      'Structural welding and reinforcement',
      'Complete interior refurbishment',
      'Professional window tinting service',
      'AC system cleaning and recharge',
      'Complete electrical system diagnostic',
      'Accident damage repair and restoration',
      'Custom metalwork and fabrication'
    ];

    const service = services[Math.floor(Math.random() * services.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const laborCost = Math.floor(Math.random() * 800) + 200;
    const partsCost = Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 100 : 0;
    
    const today = new Date();
    const pickupDays = Math.floor(Math.random() * 7) + 3;
    today.setDate(today.getDate() + pickupDays);
    const pickupDate = today.toISOString().split('T')[0];

    setOutsourcedForm({
      service_name: service,
      vendor_company_name: company,
      labor_cost: String(laborCost),
      parts_cost: String(partsCost),
      description: description,
      pickup_date: pickupDate,
    });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || userData.profile?.role || 'receptionist');
      } catch (e) {
        setUserRole('receptionist');
      }
    }

    const fetchCar = async () => {
      try {
        const data = await api.cars.get(carId);
        setCar(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car');
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

  useEffect(() => {
    if (activeTab === 'inventory' && inventoryItems.length === 0) {
      fetchInventoryItems();
    }
  }, [activeTab, inventoryItems.length]);

  useEffect(() => {
    setActionError('');
    setActionLoading(false);

    if (activeTab !== 'diagnostics') {
      setShowDiagnosticsForm(false);
      setShowOutsourcedForm(false);
    }
    if (activeTab !== 'inventory') {
      setShowInventoryForm(false);
    }
    if (activeTab !== 'invoice') {
      setShowInvoiceForm(false);
    }

    // Only repopulate forms from car data if we have diagnostics data
    if (activeTab === 'diagnostics' && car?.diagnostics) {
      setDiagnosticsForm({
        description: car.diagnostics.description || '',
        inspector_type: car.diagnostics.inspector_type || 'mechanic',
      });
    }

    // Auto-generate invoice number for new invoices
    if (activeTab === 'invoice' && !car?.invoice) {
      const basePlate = car?.number_plate ? car.number_plate.replace(/[^A-Za-z0-9]/g, '') : 'CAR';
      const autoInvoiceNumber = `INV-${basePlate}-${Date.now().toString().slice(-6)}`;
      setInvoiceForm((prev) => ({
        ...prev,
        invoice_number: autoInvoiceNumber,
      }));
    }
  }, [activeTab, car?.diagnostics, car?.invoice, car?.number_plate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch both payments and invoices
        const [paymentsData, invoicesData] = await Promise.all([
          api.payments.list(),
          api.invoices.list(),
        ]);

        const payments = Array.isArray(paymentsData) ? paymentsData : paymentsData?.results || [];
        const invoices = Array.isArray(invoicesData) ? invoicesData : invoicesData?.results || [];

        // Format transactions
        const formattedTransactions = [
          ...payments.map((p: any) => ({
            id: p.id,
            type: 'Payment',
            title: p.customer_name || 'Customer Payment',
            description: p.invoice_number ? `Invoice #${p.invoice_number}` : 'Payment',
            amount: Number(p.amount || 0),
            date: new Date(p.created_at || new Date()).toLocaleDateString(),
            status: p.status || 'completed',
          })),
          ...invoices.map((i: any) => ({
            id: i.id,
            type: 'Invoice',
            title: i.customer_name || 'Customer',
            description: i.car_number_plate ? `${i.car_number_plate}` : `Invoice #${i.invoice_number || i.id}`,
            amount: Number(i.total_amount || i.labor_cost || 0),
            date: new Date(i.created_at || new Date()).toLocaleDateString(),
            status: i.status || 'pending',
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5); // Get last 5

        setRecentTransactions(formattedTransactions);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        // Keep empty if fetch fails
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading car details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !car) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Car not found'}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <p className="text-sm text-gray-700 font-medium">
            {car.make} {car.model}{car.color && ` (${car.color})`} · Plate: {car.number_plate}
          </p>
          <select
            value={car.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdating}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg font-semibold border-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: car.status === 'new' ? '#dbeafe' : 
                              car.status === 'in_progress' ? '#fef3c7' :
                              car.status === 'completed' ? '#dcfce7' :
                              car.status === 'dispatched' ? '#e9d5ff' :
                              car.status === 'awaiting_payment' ? '#fed7aa' :
                              car.status === 'reopened' ? '#fee2e2' : '#f3f4f6',
              color: car.status === 'new' ? '#1e40af' :
                    car.status === 'in_progress' ? '#92400e' :
                    car.status === 'completed' ? '#15803d' :
                    car.status === 'dispatched' ? '#6b21a8' :
                    car.status === 'awaiting_payment' ? '#92400e' :
                    car.status === 'reopened' ? '#991b1b' : '#374151',
              borderColor: car.status === 'new' ? '#3b82f6' :
                          car.status === 'in_progress' ? '#f59e0b' :
                          car.status === 'completed' ? '#22c55e' :
                          car.status === 'dispatched' ? '#a855f7' :
                          car.status === 'awaiting_payment' ? '#f97316' :
                          car.status === 'reopened' ? '#ef4444' : '#d1d5db',
            }}
          >
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dispatched">Dispatched</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="reopened">Reopened</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border-b">
          <div className="flex flex-col gap-3 p-2 sm:p-0 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 min-w-0">
              <div className="flex overflow-x-auto no-scrollbar">
                {['info', 'diagnostics', 'inventory', 'invoice', 'history'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-3 sm:px-6 py-2.5 sm:py-4 text-sm font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-gray-800 text-gray-800'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              {currentSessionId && (
                <div className="flex flex-wrap items-center gap-2 sm:pl-4 sm:border-l">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded">
                    Viewing Session History
                  </span>
                  <button
                    onClick={handleReturnToLive}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Return to Live
                  </button>
                </div>
              )}
            </div>
            {activeTab !== 'history' && !currentSessionId && (
              <button
                onClick={handleOpenNewSession}
                className="w-full sm:w-auto sm:mr-4 bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 text-sm font-medium transition-colors rounded-lg"
              >
                Open New Session
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          {activeTab === 'info' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Car Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Make:</span>
                      <span className="ml-2 font-semibold">{car.make}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Model:</span>
                      <span className="ml-2 font-semibold">{car.model}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Plate:</span>
                      <span className="ml-2 font-semibold">{car.number_plate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mileage:</span>
                      <span className="ml-2 font-semibold">{car.mileage} km</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-semibold">{car.customer?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-semibold">{car.customer?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-semibold">{car.customer?.phone_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={handleGeneratePortalToken}
                  className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-6 py-2 rounded-lg font-medium"
                >
                  📱 Generate Customer Portal Link
                </button>
              </div>
            </>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4 text-gray-700">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {actionError}
                </div>
              )}

              {car.diagnostics ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Inspector Type:</span>
                    <span className="ml-2 font-semibold text-gray-800 capitalize">{car.diagnostics.inspector_type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Summary:</span>
                    <span className="ml-2 font-semibold text-gray-800">{car.diagnostics.description}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Performed By:</span>
                    <span className="ml-2 font-semibold">{car.diagnostics.performed_by_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Performed At:</span>
                    <span className="ml-2 font-semibold">
                      {car.diagnostics.performed_at ? new Date(car.diagnostics.performed_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <p>No diagnostics yet.</p>
              )}

              <button
                onClick={() => setShowDiagnosticsForm((prev) => !prev)}
                className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 text-sm font-medium transition-colors rounded-lg"
              >
                {car.diagnostics ? 'Update Diagnostics' : 'Add Diagnostics'}
              </button>

              {showDiagnosticsForm && (
                <form onSubmit={handleCreateDiagnostics} className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Who performed the inspection?</label>
                    <select
                      value={diagnosticsForm.inspector_type}
                      onChange={(e) =>
                        setDiagnosticsForm((prev) => ({ ...prev, inspector_type: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="mechanic">Mechanic</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={diagnosticsForm.description}
                      onChange={(e) =>
                        setDiagnosticsForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={4}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
                  >
                    {actionLoading ? 'Saving...' : 'Save Diagnostics'}
                  </button>
                </form>
              )}

              {/* Outsourced Services Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Outsourced Services</h3>
                
                {car.outsourced_services && car.outsourced_services.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {car.outsourced_services.map((service: any) => (
                      <div key={service.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-600 text-sm">Service Name:</span>
                            <span className="ml-2 font-semibold">{service.service_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Company:</span>
                            <span className="ml-2 font-semibold">{service.vendor_company_name || service.vendor_name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Labor Cost:</span>
                            <span className="ml-2 font-semibold">{formatCedi(service.labor_cost)}</span>
                          </div>
                          {service.parts_price > 0 && (
                            <div>
                              <span className="text-gray-600 text-sm">Parts Price:</span>
                              <span className="ml-2 font-semibold">{formatCedi(service.parts_price)}</span>
                            </div>
                          )}
                          {service.pickup_date && (
                            <div>
                              <span className="text-gray-600 text-sm">Pickup Date:</span>
                              <span className="ml-2 font-semibold">{new Date(service.pickup_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {service.description && (
                            <div className="col-span-2">
                              <span className="text-gray-600 text-sm">Description:</span>
                              <p className="mt-1 text-sm">{service.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 mb-4">No outsourced services yet.</p>
                )}

                <button
                  onClick={() => setShowOutsourcedForm((prev) => !prev)}
                  className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 text-sm font-medium transition-colors rounded-lg"
                >
                  {showOutsourcedForm ? 'Cancel' : 'Add Outsourced Service'}
                </button>

                {showOutsourcedForm && (
                  <form onSubmit={handleCreateOutsourcedService} className="space-y-4 border-t pt-4 mt-4">
                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={fillOutsourcedDummyData}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm"
                      >
                        Fill with Dummy Data
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                        <input
                          type="text"
                          value={outsourcedForm.service_name}
                          onChange={(e) =>
                            setOutsourcedForm((prev) => ({ ...prev, service_name: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="e.g., Body Spray, Welding"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                        <input
                          type="text"
                          value={outsourcedForm.vendor_company_name}
                          onChange={(e) =>
                            setOutsourcedForm((prev) => ({ ...prev, vendor_company_name: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Outsource company name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost (₵) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={outsourcedForm.labor_cost}
                          onChange={(e) =>
                            setOutsourcedForm((prev) => ({ ...prev, labor_cost: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                        <input
                          type="date"
                          value={outsourcedForm.pickup_date}
                          onChange={(e) =>
                            setOutsourcedForm((prev) => ({ ...prev, pickup_date: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parts Purchase Cost (₵)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={outsourcedForm.parts_cost}
                          onChange={(e) =>
                            setOutsourcedForm((prev) => ({ ...prev, parts_cost: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                      <textarea
                        value={outsourcedForm.description}
                        onChange={(e) =>
                          setOutsourcedForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Details about the service to be rendered"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
                    >
                      {actionLoading ? 'Saving...' : 'Add Outsourced Service'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {actionError}
                </div>
              )}

              {car.inventory_assignments?.length ? (
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Item Name</th>
                        <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Quantity</th>
                        <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Cost Price</th>
                        <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Selling Price</th>
                        <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {car.inventory_assignments.map((assignment: any) => (
                        <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">
                          <td className="px-4 py-2.5 text-sm text-gray-600 font-medium">{assignment.inventory_item_name || 'Item'}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">{assignment.quantity}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">{formatCedi(assignment.cost_price)}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 font-semibold">{formatCedi(assignment.selling_price)}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 font-bold text-gray-800">{formatCedi(Number(assignment.quantity) * Number(assignment.selling_price))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-left text-base sm:text-lg font-semibold text-gray-700">
                          Total Inventory Cost:
                        </td>
                        <td className="px-6 py-4 text-xl sm:text-2xl font-bold text-primary-700">
                          {formatCedi(
                            car.inventory_assignments.reduce(
                              (sum: number, assignment: any) => 
                                sum + (Number(assignment.quantity) * Number(assignment.selling_price)),
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No inventory items assigned yet.</p>
              )}

              <button
                onClick={() => {
                  setShowInventoryForm((prev) => !prev);
                  if (inventoryItems.length === 0) {
                    fetchInventoryItems();
                  }
                }}
                className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 text-sm font-medium transition-colors rounded-lg"
              >
                Assign Items
              </button>

              {showInventoryForm && (
                <form onSubmit={handleAssignInventory} className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item</label>
                    <select
                      value={inventoryForm.inventory_item}
                      onChange={(e) => {
                        const itemId = e.target.value;
                        const selected = inventoryItems.find((item) => String(item.id) === itemId);
                        setInventoryForm((prev) => ({
                          ...prev,
                          inventory_item: itemId,
                          cost_price: selected?.cost_price || '',
                          selling_price: selected?.selling_price || '',
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select an item</option>
                      {inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {loadingInventoryItems && (
                      <p className="text-xs text-gray-500 mt-1">Loading inventory items...</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={inventoryForm.quantity}
                        onChange={(e) =>
                          setInventoryForm((prev) => ({ ...prev, quantity: Number(e.target.value || 1) }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                      <input
                        type="number"
                        min={0}
                        value={inventoryForm.cost_price}
                        onChange={(e) =>
                          setInventoryForm((prev) => ({ ...prev, cost_price: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                      <input
                        type="number"
                        min={0}
                        value={inventoryForm.selling_price}
                        onChange={(e) =>
                          setInventoryForm((prev) => ({ ...prev, selling_price: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        id="customerProvided"
                        type="checkbox"
                        checked={inventoryForm.is_customer_provided}
                        onChange={(e) =>
                          setInventoryForm((prev) => ({ ...prev, is_customer_provided: e.target.checked }))
                        }
                      />
                      <label htmlFor="customerProvided" className="text-sm text-gray-700">
                        Customer Provided
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
                  >
                    {actionLoading ? 'Assigning...' : 'Assign Item'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="space-y-4">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {actionError}
                </div>
              )}

              {car.invoice ? (
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="text-gray-600">Invoice #:</span>
                    <span className="ml-2 font-semibold">{car.invoice.invoice_number || car.invoice.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-semibold">{car.invoice.status_display || car.invoice.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Parts Cost:</span>
                    <span className="ml-2 font-semibold">{formatCedi(car.invoice.parts_cost)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Labor Cost:</span>
                    <span className="ml-2 font-semibold">{formatCedi(car.invoice.labor_cost)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Outsourced Parts Purchase Cost:</span>
                    <span className="ml-2 font-semibold">{formatCedi(calculateOutsourcedPartsCost())}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Outsourced Labor Cost:</span>
                    <span className="ml-2 font-semibold">{formatCedi(calculateOutsourcedLaborCost())}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tax:</span>
                    <span className="ml-2 font-semibold">{formatCedi(car.invoice.tax_amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-semibold">{formatCedi(car.invoice.total_amount)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No invoice yet.</p>
              )}

              {!car.invoice && (
                <button
                  onClick={() => setShowInvoiceForm((prev) => !prev)}
                  className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 text-sm font-medium transition-colors rounded-lg"
                >
                  Create Invoice
                </button>
              )}

              {showInvoiceForm && !car.invoice && (
                <form onSubmit={handleCreateInvoice} className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceForm.invoice_number}
                      onChange={(e) =>
                        setInvoiceForm((prev) => ({ ...prev, invoice_number: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Parts Cost (Auto-calculated from Inventory)</span>
                      <span className="text-lg font-bold text-primary-700">{formatCedi(calculatePartsCost())}</span>
                    </div>
                    {car?.inventory_assignments && car.inventory_assignments.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="space-y-1">
                          {car.inventory_assignments.map((assignment: any) => (
                            <div key={assignment.id} className="flex justify-between">
                              <span>{assignment.inventory_item_name} × {assignment.quantity}</span>
                              <span>{formatCedi(Number(assignment.quantity) * Number(assignment.selling_price))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Outsourced Parts Purchase Cost</span>
                      <span className="text-lg font-bold text-gray-700">{formatCedi(calculateOutsourcedPartsCost())}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-gray-700">Outsourced Labor Cost</span>
                      <span className="text-lg font-bold text-gray-700">{formatCedi(calculateOutsourcedLaborCost())}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
                      <input
                        type="number"
                        min={0}
                        value={invoiceForm.labor_cost}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({ ...prev, labor_cost: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={invoiceForm.due_date}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({ ...prev, due_date: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
                  >
                    {actionLoading ? 'Creating...' : 'Create Invoice'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 text-gray-700">
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">Visit Session</h4>
                          <p className="text-sm text-gray-500">{session.timestamp}</p>
                        </div>
                        {currentSessionId === session.id && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Current</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="ml-2 font-semibold">{session.status}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <span className="ml-2 font-semibold">{session.reason || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Diagnostics:</span>
                          <span className="ml-2 font-semibold">{session.diagnostics?.description ? '✓' : '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Invoice:</span>
                          <span className="ml-2 font-semibold">{session.invoice ? '✓' : '—'}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleViewSessionDetails(session)}
                          className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 text-sm font-medium transition-colors rounded-lg"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No previous sessions yet. Start a new session to begin tracking visits.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Portal Modal */}
        {showPortalModal && portalToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Portal Link</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share this link with your customer to track their car status, invoices, and services:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {`${window.location.origin}/customer-portal?token=${portalToken}`}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                <p className="text-xs text-blue-800">
                  ℹ️ This link does not require a password. Keep it secure and share only with the car owner.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/customer-portal?token=${portalToken}`)}
                  className="flex-1 bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 py-2 px-4 rounded-lg font-medium"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => setShowPortalModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Session Modal */}
        {showNewSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">✓ New Session Started</h3>
              <p className="text-gray-600 mb-6">
                Current session has been saved to history. All forms are cleared and ready for new input.
              </p>
              
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="w-full bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 py-2 px-4 rounded-lg font-medium"
              >
                Begin Service
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

