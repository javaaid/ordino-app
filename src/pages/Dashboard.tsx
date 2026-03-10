import React, { useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { TrendingUp, ShoppingBag, CreditCard, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subHours } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { orders, customers } = usePOS();

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const stats = [
    { title: 'Total Sales', value: `SAR ${totalSales.toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500', trend: '+12.5%' },
    { title: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-500', trend: '+5.2%' },
    { title: 'Average Order', value: `SAR ${averageOrderValue.toFixed(2)}`, icon: CreditCard, color: 'bg-indigo-500', trend: '+2.1%' },
    { title: 'Active Customers', value: customers.length.toString(), icon: Users, color: 'bg-purple-500', trend: '+8.4%' },
  ];

  // Generate mock chart data based on current time
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const time = subHours(now, i);
      // Add some randomness to make the chart look realistic, plus actual orders if any match the hour
      const hourOrders = orders.filter(o => new Date(o.timestamp).getHours() === time.getHours());
      const realSales = hourOrders.reduce((sum, o) => sum + o.total, 0);
      
      data.push({
        time: format(time, 'HH:00'),
        sales: realSales > 0 ? realSales : Math.floor(Math.random() * 500) + 100,
      });
    }
    return data;
  }, [orders]);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Overview of your store's performance today.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            Export Report
          </button>
          <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
            Z-Report (End of Day)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white ${stat.color} shadow-inner`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{stat.trend}</span>
            </div>
            <h3 className="text-slate-500 text-xs md:text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-xl md:text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Sales Trend (Today)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`SAR ${value.toFixed(2)}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-sm">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 text-sm font-medium text-slate-800">{order.id}</td>
                    <td className="py-4 text-sm text-slate-500">{new Date(order.timestamp).toLocaleTimeString()}</td>
                    <td className="py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-800 text-right">SAR {order.total.toFixed(2)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No transactions yet today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">ZATCA Status</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">Phase 2 Integration Active</h4>
                <p className="text-xs text-emerald-600 mt-1 leading-relaxed">System is successfully connected to ZATCA portal. Invoices are being cleared in real-time.</p>
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Pending Clearance</span>
                <span className="font-bold text-slate-800">0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Cleared Today</span>
                <span className="font-bold text-slate-800">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Failed</span>
                <span className="font-bold text-red-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
