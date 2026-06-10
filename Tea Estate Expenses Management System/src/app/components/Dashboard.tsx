import { Users, Building2, ClipboardList, DollarSign, TrendingUp, Leaf, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { workers, estates, dailyAssignments, expenses, calendarEvents } from '../data/mockData';

const monthlyData = [
  { month: 'Jan', payments: 185000, expenses: 92000, harvest: 2800 },
  { month: 'Feb', payments: 162000, expenses: 78000, harvest: 2450 },
  { month: 'Mar', payments: 198000, expenses: 105000, harvest: 3100 },
  { month: 'Apr', payments: 221000, expenses: 88000, harvest: 3400 },
  { month: 'May', payments: 245000, expenses: 112000, harvest: 3750 },
  { month: 'Jun', payments: 189000, expenses: 95000, harvest: 2900 },
];

const harvestData = [
  { section: 'Sec Alpha', kg: 1850 },
  { section: 'Sec Beta', kg: 2200 },
  { section: 'Sec Gamma', kg: 1650 },
  { section: 'North Hill', kg: 980 },
  { section: 'East Block', kg: 1420 },
  { section: 'West Block', kg: 1180 },
];

const recentActivity = [
  { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', text: 'Daily assignment submitted for Section Alpha', time: '2 hours ago' },
  { icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', text: 'Expense LKR 45,000 pending approval', time: '4 hours ago' },
  { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', text: 'New worker EMP008 added to Greenleaf Estate', time: '1 day ago' },
  { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', text: 'Reminder: Payroll processing due June 28', time: '1 day ago' },
  { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', text: 'Assignment approved for Section Beta', time: '2 days ago' },
];

const stats = [
  { label: 'Active Workers', value: workers.filter(w => w.status === 'active').length, icon: Users, color: 'bg-blue-500', light: 'bg-blue-50', textColor: 'text-blue-700', sub: `${workers.length} total` },
  { label: 'Active Estates', value: estates.filter(e => e.status === 'active').length, icon: Building2, color: 'bg-emerald-500', light: 'bg-emerald-50', textColor: 'text-emerald-700', sub: `${estates.length} total` },
  { label: "Today's Assignments", value: dailyAssignments.filter(d => d.date === '2026-06-01').length, icon: ClipboardList, color: 'bg-purple-500', light: 'bg-purple-50', textColor: 'text-purple-700', sub: 'Pending review' },
  { label: 'Monthly Expenses', value: 'LKR 1.12L', icon: DollarSign, color: 'bg-orange-500', light: 'bg-orange-50', textColor: 'text-orange-700', sub: '↑ 12% from last month' },
];

export function Dashboard() {
  const upcomingEvents = calendarEvents.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Welcome back, Rajesh</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monday, June 1, 2026 — Here's your estate overview</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <Leaf className="w-4 h-4 text-green-600" />
          <span className="text-green-700 text-sm">Peak Harvest Season</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, light, textColor, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className={`text-2xl font-semibold ${textColor}`}>{value}</p>
                <p className="text-gray-400 text-xs mt-1">{sub}</p>
              </div>
              <div className={`${light} p-2.5 rounded-xl`}>
                <Icon className={`w-5 h-5 ${textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Monthly Overview</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Payments</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={18} barGap={4}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v/1000}k`} />
              <Tooltip key="tooltip" formatter={(val: number) => [`LKR ${val.toLocaleString()}`, '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar key="bar-payments" dataKey="payments" fill="#16a34a" radius={[4, 4, 0, 0]} name="Payments" />
              <Bar key="bar-expenses" dataKey="expenses" fill="#fb923c" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Harvest by Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 mb-4">Harvest by Section (KG)</h3>
          <div className="space-y-3">
            {harvestData.map((item) => {
              const max = Math.max(...harvestData.map(d => d.kg));
              const pct = (item.kg / max) * 100;
              return (
                <div key={item.section}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.section}</span>
                    <span className="text-gray-800 font-medium">{item.kg.toLocaleString()} kg</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`${item.bg} p-1.5 rounded-lg flex-shrink-0 mt-0.5`}>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 text-sm leading-snug">{item.text}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: event.color }} />
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">{event.title}</p>
                  <p className="text-gray-500 text-xs">{event.startDate} · {event.recurrence !== 'none' ? `Repeats ${event.recurrence}` : 'One-time'}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{event.category}</span>
              </div>
            ))}
          </div>

          {/* Quick Estate Status */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-xs mb-3">Estate Status</p>
            <div className="grid grid-cols-2 gap-2">
              {estates.slice(0, 2).map(e => (
                <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${e.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-700 truncate">{e.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
