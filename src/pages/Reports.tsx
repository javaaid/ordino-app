import React from 'react';
import { usePOS } from '../context/POSContext';
import { FileText, Download, Calendar, PieChart } from 'lucide-react';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
  const { orders } = usePOS();

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalVat = orders.reduce((sum, order) => sum + order.vatTotal, 0);
  const totalSubtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);

  const paymentMethods = orders.reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">View detailed sales, tax, and ZATCA compliance reports.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> Today
          </button>
          <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Sales Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Gross Sales (Excl. VAT)</span>
              <span className="font-semibold text-slate-800">SAR {totalSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Total VAT Collected</span>
              <span className="font-semibold text-slate-800">SAR {totalVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-800 font-bold">Net Sales</span>
              <span className="font-bold text-indigo-600 text-xl">SAR {totalSales.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Payment Breakdown</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(paymentMethods).map(([method, amount]) => (
              <div key={method} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-slate-500 text-sm">{method}</span>
                <span className="font-semibold text-slate-800">SAR {(amount as number).toFixed(2)}</span>
              </div>
            ))}
            {Object.keys(paymentMethods).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No payments yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">ZATCA Compliance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Invoices Generated</span>
              <span className="font-semibold text-slate-800">{orders.length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">B2C Simplified Tax Invoices</span>
              <span className="font-semibold text-slate-800">{orders.filter(o => o.invoiceType === 'Simplified').length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">B2B Tax Invoices</span>
              <span className="font-semibold text-slate-800">{orders.filter(o => o.invoiceType === 'Tax').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

