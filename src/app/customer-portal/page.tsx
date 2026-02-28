'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/brooks-api';
import Link from 'next/link';

function CustomerPortalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'dispatched': 'bg-purple-100 text-purple-800',
      'awaiting_payment': 'bg-orange-100 text-orange-800',
      'reopened': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing portal link');
      setLoading(false);
      return;
    }

    const fetchCarData = async () => {
      try {
        const data = await api.cars.getCustomerPortal(token);
        setCar(data);
      } catch (err) {
        setError('Invalid or expired portal link. Please contact the shop for a new link.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Loading car information...</div>
          <div className="animate-spin">⏳</div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">⚠️ Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Car information not found'}</p>
          <Link href="/">
            <button className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-6 py-2 rounded-lg">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/photo_2026-02-22_00-23-34.jpg"
                alt="Brooksmekaniks"
                className="w-12 h-12 md:w-14 md:h-14 rounded bg-black object-cover"
              />
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">BROOKSMEKANIKS</h2>
                <p className="text-xs md:text-sm text-gray-600">Solutions you can trust</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 md:border-t-0 md:pt-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-tight">Service Status Tracker</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Track your vehicle&apos;s progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Car Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {car.make} {car.model}{car.color && ` (${car.color})`}
              </h2>
              <p className="text-gray-600 text-lg">Plate: {car.number_plate}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(car.status)}`}>
              {car.status_display || car.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Mileage</p>
              <p className="font-semibold text-gray-800">{car.mileage} km</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Reason for Visit</p>
              <p className="font-semibold text-gray-800">{car.reason_for_visit}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Service Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(car.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">📞 Contact Information</h3>
          <div className="space-y-2">
            <p className="text-gray-700"><strong>Name:</strong> {car.customer_name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {car.customer_email}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {car.customer_phone}</p>
          </div>
        </div>

        {/* Diagnostics */}
        {car.all_diagnostics && car.all_diagnostics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">🔍 Diagnostics</h3>
            <div className="space-y-4">
              {car.all_diagnostics.map((diag: any, idx: number) => (
                <div key={idx} className="border-l-2 border-blue-500 pl-4">
                  <p className="text-gray-600 text-sm">Inspection by: {diag.inspector_type}</p>
                  <p className="font-semibold text-gray-800">{diag.description}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(diag.performed_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Items Used */}
        {car.inventory_assignments && car.inventory_assignments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">🔧 Parts Used</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Part</th>
                    <th className="px-4 py-2 text-left font-semibold">Quantity</th>
                    <th className="px-4 py-2 text-right font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {car.inventory_assignments.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.inventory_item_name || 'Unknown'}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {formatCedi(Number(item.selling_price || 0) * Number(item.quantity || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Outsourced Services */}
        {car.outsourced_services && car.outsourced_services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">🏭 Outsourced Services</h3>
            <div className="space-y-4">
              {car.outsourced_services.map((service: any, idx: number) => (
                <div key={idx} className="border-l-2 border-orange-500 pl-4 p-3 bg-orange-50 rounded">
                  <p className="font-semibold text-gray-800">{service.service_name}</p>
                  <p className="text-gray-600 text-sm">Company: {service.vendor_company_name}</p>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                  <div className="mt-2 flex gap-4">
                    <span className="text-sm"><strong>Labor:</strong> {formatCedi(service.labor_cost)}</span>
                    <span className="text-sm"><strong>Parts:</strong> {formatCedi(service.parts_cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {car.all_invoices && car.all_invoices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">📄 Invoices</h3>
            <div className="space-y-3">
              {car.all_invoices.map((invoice: any, idx: number) => (
                <div key={idx} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">Invoice #{invoice.invoice_number}</p>
                      <p className="text-gray-600 text-sm">
                        Created: {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                      {invoice.due_date && (
                        <p className="text-gray-600 text-sm">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-800">
                        {formatCedi(invoice.total_amount)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-2">Questions? Contact us</p>
          <p className="text-gray-800 font-semibold">📞 024 352 5167</p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">Loading car information...</div>
            <div className="animate-spin">⏳</div>
          </div>
        </div>
      }
    >
      <CustomerPortalContent />
    </Suspense>
  );
}
