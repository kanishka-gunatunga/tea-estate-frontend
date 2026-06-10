import { useState } from 'react';
import { Plus, Search, X, Pencil, Trash2, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { expenses as initialExpenses, Expense, expenseCategories, estates, sections } from '../data/mockData';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const categoryIcons: Record<string, string> = {
  Fuel: '⛽', Tools: '🔧', Chemicals: '🧪', Maintenance: '🏗️',
  Office: '📄', Transport: '🚛', Utilities: '💡', Other: '📦'
};

const categoryColors: Record<string, string> = {
  Fuel: 'bg-orange-50 text-orange-700 border-orange-200',
  Tools: 'bg-blue-50 text-blue-700 border-blue-200',
  Chemicals: 'bg-purple-50 text-purple-700 border-purple-200',
  Maintenance: 'bg-gray-50 text-gray-700 border-gray-200',
  Office: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Transport: 'bg-teal-50 text-teal-700 border-teal-200',
  Utilities: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Other: 'bg-pink-50 text-pink-700 border-pink-200',
};

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    description: '',
    amount: '',
    estateId: 'e1',
    sectionId: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  });

  const filtered = expenses.filter(e =>
    (categoryFilter === 'all' || e.category === categoryFilter) &&
    (statusFilter === 'all' || e.status === statusFilter) &&
    (e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalByCategory = expenseCategories.reduce((acc, cat) => {
    const total = expenses.filter(e => e.category === cat && e.status !== 'rejected').reduce((s, e) => s + e.amount, 0);
    return { ...acc, [cat]: total };
  }, {} as Record<string, number>);

  const grandTotal = Object.values(totalByCategory).reduce((s, v) => s + v, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  const openAdd = () => {
    setEditing(null);
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Fuel', description: '', amount: '', estateId: 'e1', sectionId: '', status: 'pending' });
    setShowModal(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({ date: e.date, category: e.category, description: e.description, amount: String(e.amount), estateId: e.estateId, sectionId: e.sectionId || '', status: e.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.description || !form.amount) return;
    if (editing) {
      setExpenses(es => es.map(e => e.id === editing.id ? { ...e, ...form, amount: Number(form.amount) } : e));
    } else {
      setExpenses(es => [...es, { id: `ex${Date.now()}`, ...form, amount: Number(form.amount) }]);
    }
    setShowModal(false);
  };

  const estateSectionsForForm = sections.filter(s => s.estateId === form.estateId);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pendingCount} pending approval · LKR {grandTotal.toLocaleString()} total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Expense</span>
        </button>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {expenseCategories.filter(cat => totalByCategory[cat] > 0).slice(0, 4).map(cat => (
          <div
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${categoryFilter === cat ? 'ring-2 ring-green-400' : ''} ${categoryColors[cat] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{categoryIcons[cat] || '📦'}</span>
              <TrendingUp className="w-3.5 h-3.5 opacity-50" />
            </div>
            <p className="text-xs opacity-70">{cat}</p>
            <p className="font-semibold text-sm mt-0.5">LKR {totalByCategory[cat].toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="all">All Categories</option>
            {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${statusFilter === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Estate / Section</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(expense => {
                const estate = estates.find(e => e.id === expense.estateId);
                const section = sections.find(s => s.id === expense.sectionId);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${categoryColors[expense.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <span>{categoryIcons[expense.category]}</span>
                        <span>{expense.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm max-w-48 truncate">{expense.description}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      <span>{estate?.name?.split(' ')[0]}</span>
                      {section && <span className="text-gray-400"> · {section.name}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{expense.date}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-gray-800 text-sm font-medium">LKR {expense.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                        expense.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>{expense.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(expense)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-300 hover:text-blue-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setExpenses(es => es.filter(e => e.id !== expense.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No expenses found</p>
            </div>
          )}
        </div>

        {/* Footer Total */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-gray-500 text-sm">{filtered.length} records</span>
          <span className="text-gray-800 text-sm font-medium">
            Filtered Total: LKR {filtered.reduce((s, e) => s + e.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Expense' : 'Add New Expense'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {expenseCategories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" placeholder="Describe the expense..." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount (LKR) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estate</label>
                <select value={form.estateId} onChange={e => setForm(f => ({ ...f, estateId: e.target.value, sectionId: '' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Section (optional)</label>
                <select value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">All sections</option>
                  {estateSectionsForForm.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editing ? 'Save Changes' : 'Add Expense'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
