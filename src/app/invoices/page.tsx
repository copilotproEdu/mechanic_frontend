'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';
import jsPDF from 'jspdf';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('receptionist');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [printingInvoiceId, setPrintingInvoiceId] = useState<string | null>(null);
  const [modalPaymentMethods, setModalPaymentMethods] = useState('N/A');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'receptionist');
      } catch (e) {
        setUserRole('receptionist');
      }
    }
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await api.invoices.list();
        setInvoices(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const openInvoiceModal = async (invoiceId: string) => {
    setShowInvoiceModal(true);
    setModalLoading(true);
    try {
      const data = await api.invoices.get(invoiceId);
      setSelectedInvoice(data);
      setModalPaymentMethods('N/A');

      try {
        let allPayments: any[] = [];
        try {
          const paymentsResponse = await api.payments.list({ invoice: invoiceId });
          allPayments = paymentsResponse?.results || paymentsResponse || [];
        } catch {
          const fallbackPayments = await api.payments.list();
          allPayments = fallbackPayments?.results || fallbackPayments || [];
        }

        const invoicePayments = allPayments.filter((payment: any) => {
          return payment.invoice === invoiceId || payment.invoice_id === invoiceId;
        });

        const paymentMethods = invoicePayments.length
          ? Array.from(new Set(invoicePayments.map((payment: any) => formatPaymentMethod(payment.payment_method || '')))).join(', ')
          : 'N/A';

        setModalPaymentMethods(paymentMethods);
      } catch {
        setModalPaymentMethods('N/A');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice details');
      setShowInvoiceModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const handleEditInvoice = async (invoice: any) => {
    try {
      if (invoice?.id) {
        await api.invoices.reopen(invoice.id);
      }
    } catch {
      // Continue to edit page even if reopen fails due role restrictions; page will show backend error on save if needed.
    }

    if (invoice?.car) {
      router.push(`/cars/${invoice.car}?tab=invoice&editInvoice=1`);
    }
  };

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString()}`;
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'approved': 'bg-green-100 text-green-800',
      'discharged': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPaymentMethod = (method: string) => {
    if (!method) return 'N/A';
    return method
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const getInvoiceLineItems = (invoice: any) => {
    const items: Array<{ description: string; unitPrice: number; amount: number }> = [];

    const partsCost = Number(invoice.parts_cost || 0);
    const laborCost = Number(invoice.labor_cost || 0);
    const outsourcedCost = Number(invoice.outsourced_cost || 0);
    const taxAmount = Number(invoice.tax_amount || 0);
    const totalAmount = Number(invoice.total_amount || 0);

    items.push(
      { description: 'Parts Cost', unitPrice: partsCost, amount: partsCost },
      { description: 'Labor Cost', unitPrice: laborCost, amount: laborCost },
      { description: 'Outsourced Cost', unitPrice: outsourcedCost, amount: outsourcedCost },
      { description: 'Tax', unitPrice: taxAmount, amount: taxAmount }
    );

    const subtotal = partsCost + laborCost + outsourcedCost + taxAmount;
    const difference = Number((totalAmount - subtotal).toFixed(2));

    if (Math.abs(difference) >= 0.01) {
      items.push({
        description: difference > 0 ? 'Additional Charges' : 'Discount/Adjustment',
        unitPrice: difference,
        amount: difference,
      });
    }

    return items;
  };

  const paymentDetails = [
    'Brooks Mekaniks Limited Investment Bank',
    '1136061074601',
    'East legon Branch.',
    'Momo',
    '0243525167',
    'Simon Mawuli Ocloo',
  ];

  const handlePrintInvoice = async (invoiceRef: any) => {
    const invoiceId = invoiceRef?.id;
    if (!invoiceId) return;

    setPrintingInvoiceId(invoiceId);
    setError('');

    try {
      const invoice = await api.invoices.get(invoiceId);

      let allPayments: any[] = [];
      try {
        const paymentsResponse = await api.payments.list({ invoice: invoiceId });
        allPayments = paymentsResponse?.results || paymentsResponse || [];
      } catch {
        const fallbackPayments = await api.payments.list();
        allPayments = fallbackPayments?.results || fallbackPayments || [];
      }

      const invoicePayments = allPayments.filter((payment: any) => {
        return payment.invoice === invoiceId || payment.invoice_id === invoiceId;
      });

      const paymentMethods = invoicePayments.length
        ? Array.from(new Set(invoicePayments.map((payment: any) => formatPaymentMethod(payment.payment_method || '')))).join(', ')
        : 'N/A';

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;

      const invoiceNumber = invoice.invoice_number || `INV-${invoice.id.slice(0, 8).toUpperCase()}`;
      const lineItems = getInvoiceLineItems(invoice);
      const issueDate = invoice.created_at ? new Date(invoice.created_at) : new Date();
      const formattedIssueDate = issueDate.toLocaleDateString();
      const loadImageAsDataUrl = async (src: string) => {
        const response = await fetch(src);
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      };

      const logoDataUrl = await loadImageAsDataUrl('/images/photo_2026-02-22_00-23-34.jpg');

      // Header with logo and company info
      const headerTop = 16;
      const logoSize = 32;
      const contentLeft = margin + logoSize + 10;
      
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'JPEG', margin, headerTop, logoSize, logoSize);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('BROOKSMEKANIKS', contentLeft, headerTop + 7);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Solutions you can trust', contentLeft, headerTop + 14);
      doc.text('East Legon · 024 352 5167 / 050 726 7667', contentLeft, headerTop + 20);
      doc.text('brooksmekaniks22@gmail.com', contentLeft, headerTop + 26);

      // Services line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('DIAGNOSTICS · MECHANICAL WORKS · BODY WORKS · AIR CONDITIONING · INTERIOR & EXTERIOR DETAILING', margin, headerTop + 40);
      doc.setTextColor(0, 0, 0);

      // PRO FORMA / INVOICE title and details
      const invoiceInfoTop = headerTop + 54;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('PRO FORMA / INVOICE', margin, invoiceInfoTop);

      // Date on right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Date', pageWidth - margin - 40, invoiceInfoTop + 1);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(formattedIssueDate, pageWidth - margin - 40, invoiceInfoTop + 8);

      // Invoice number (left)
      const invoiceNoTop = invoiceInfoTop + 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Invoice No:', margin, invoiceNoTop);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceNumber, margin + 24, invoiceNoTop);

      // Client info
      const clientTop = invoiceNoTop + 12;
      doc.setTextColor(100, 100, 100);
      doc.text('Client:', margin, clientTop);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(invoice.customer_name || 'N/A', margin + 15, clientTop);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Car:', margin, clientTop + 7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(invoice.car_number_plate || 'N/A', margin + 15, clientTop + 7);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Payment Method:', margin, clientTop + 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(paymentMethods, margin + 35, clientTop + 14);

      // Content section
      const contentTop = clientTop + 24;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Content', margin, contentTop);

      // Table
      const tableTop = contentTop + 6;
      const tableLeft = margin;
      const tableRight = pageWidth - margin;
      const tableWidth = tableRight - tableLeft;
      const descCol = tableWidth * 0.55;
      const unitCol = tableWidth * 0.22;
      const amtCol = tableWidth * 0.23;

      // Table header with gray background
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.rect(tableLeft, tableTop, tableWidth, 11, 'FD');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text('Item Description', tableLeft + 3, tableTop + 7);
      doc.text('Unit Price', tableLeft + descCol + 3, tableTop + 7);
      doc.text('Amt (GHC)', tableLeft + descCol + unitCol + 3, tableTop + 7);

      // Table rows
      let currentY = tableTop + 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);

      lineItems.forEach((item, index) => {
        const rowHeight = 10;
        doc.setDrawColor(229, 231, 235);
        doc.line(tableLeft, currentY, tableRight, currentY);
        
        doc.text(item.description, tableLeft + 3, currentY + 6.5);
        doc.text(`GHC ${Number(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, tableLeft + descCol + unitCol - 3, currentY + 6.5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`GHC ${Number(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, tableRight - 3, currentY + 6.5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        currentY += rowHeight;
      });

      // Bottom border of table
      doc.setDrawColor(229, 231, 235);
      doc.line(tableLeft, currentY, tableRight, currentY);
      doc.rect(tableLeft, tableTop, tableWidth, currentY - tableTop, 'S');

      // Total only (avoid repeating full cost breakdown)
      const summaryTop = currentY + 10;
      const labelX = pageWidth - margin - 85;
      const valueX = pageWidth - margin;
      doc.setDrawColor(229, 231, 235);
      doc.line(labelX - 5, summaryTop, valueX, summaryTop);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('Total', labelX, summaryTop + 8);
      doc.text(`GHC ${Number(invoice.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, summaryTop + 8, { align: 'right' });

      // Payment details block at the bottom
      const paymentDetailsTop = summaryTop + 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text('Payment Details', margin, paymentDetailsTop);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      paymentDetails.forEach((line, index) => {
        if (line === '1136061074601' || line === '0243525167') {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        doc.setFontSize(10);
        doc.text(line, margin, paymentDetailsTop + 7 + (index * 6));
      });

      doc.save(`${invoiceNumber}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print invoice');
    } finally {
      setPrintingInvoiceId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading invoices...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex justify-start items-center">
          <button
            onClick={() => router.push('/dashboard/receptionist')}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="dashboard-section p-8 text-center text-gray-600">
            No invoices yet
          </div>
        ) : (
          <div className="dashboard-table">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Invoice #</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Car</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Total</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-sm font-medium text-gray-900">{invoice.invoice_number || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{invoice.car_number_plate || 'N/A'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{invoice.customer_name || 'N/A'}</td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">{formatCedi(invoice.total_amount)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(invoice.status)}`}>
                        {invoice.status_display || invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openInvoiceModal(invoice.id)}
                          className="px-2.5 py-1 text-xs rounded-md font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          disabled={printingInvoiceId === invoice.id}
                          className="px-2.5 py-1 text-xs rounded-md font-medium bg-[#ffe600] text-gray-900 hover:bg-[#f5dc00] disabled:bg-gray-400"
                        >
                          {printingInvoiceId === invoice.id ? 'Printing...' : 'Print'}
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="px-2.5 py-1 text-xs rounded-md font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeInvoiceModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>

            {modalLoading ? (
              <div className="text-center text-gray-600 py-12">Loading invoice details...</div>
            ) : selectedInvoice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src="/images/photo_2026-02-22_00-23-34.jpg"
                      alt="Brooksmekaniks"
                      className="w-14 h-14 rounded bg-black object-cover"
                    />
                    <div>
                      <h2 className="text-base font-bold text-gray-900">BROOKSMEKANIKS</h2>
                      <p className="text-xs text-gray-500">Solutions you can trust</p>
                      <p className="text-xs text-gray-500">East Legon · 024 352 5167 / 050 726 7667</p>
                      <p className="text-xs text-gray-500">brooksmekaniks22@gmail.com</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status_display || selectedInvoice.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Diagnostics · Mechanical Works · Body Works · Air Conditioning · Interior & Exterior Detailing
                </div>

                <div className="flex items-start justify-between gap-4 text-sm text-gray-700">
                  <div className="space-y-2">
                    <div className="text-base font-bold text-gray-900">PRO FORMA / INVOICE</div>
                    <div>
                      <span className="text-gray-500">Invoice No:</span>
                      <span className="ml-2 font-semibold">{selectedInvoice.invoice_number || `INV-${selectedInvoice.id.slice(0, 8).toUpperCase()}`}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Client:</span>
                      <span className="ml-2 font-semibold">{selectedInvoice.customer_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Car:</span>
                      <span className="ml-2 font-semibold">{selectedInvoice.car_number_plate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="ml-2 font-semibold">{modalPaymentMethods}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="text-sm font-semibold">
                      {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Content</div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Item Description</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Amt (GHC)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getInvoiceLineItems(selectedInvoice).map((item, index) => (
                          <tr key={`${item.description}-${index}`} className="border-t">
                            <td className="px-3 py-2 text-gray-700">{item.description}</td>
                            <td className="px-3 py-2 text-right">{formatCedi(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{formatCedi(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>{formatCedi(selectedInvoice.total_amount)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-1 text-sm text-gray-700">
                  <div className="text-sm font-semibold text-gray-800">Payment Details</div>
                  {paymentDetails.map((line) => (
                    <p key={line} className={line === '1136061074601' || line === '0243525167' ? 'font-semibold' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 py-12">No invoice details found.</div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


