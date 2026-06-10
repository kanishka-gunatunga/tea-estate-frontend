import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, UserSquare2 } from 'lucide-react';
import { workers as initialWorkers, Worker, services, estates } from '../data/mockData';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function WorkerManagement() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [search, setSearch] = useState('');
  const [estateFilter, setEstateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState({
    name: '', employeeId: '', phone: '', address: '', dob: '', joinDate: '',
    gender: 'male' as 'male' | 'female',
    serviceCategories: [] as string[],
    status: 'active' as 'active' | 'inactive',
    estateId: 'e1'
  });

  const filtered = workers.filter(w =>
    (estateFilter === 'all' || w.estateId === estateFilter) &&
    (statusFilter === 'all' || w.status === statusFilter) &&
    (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.includes(search)
    )
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', employeeId: `EMP${String(workers.length + 1).padStart(3, '0')}`,
      phone: '', address: '', dob: '', joinDate: new Date().toISOString().split('T')[0],
      gender: 'male', serviceCategories: [], status: 'active', estateId: 'e1'
    });
    setShowModal(true);
  };

  const openEdit = (w: Worker) => {
    setEditing(w);
    setForm({
      name: w.name, employeeId: w.employeeId, phone: w.phone, address: w.address,
      dob: w.dob, joinDate: w.joinDate, gender: w.gender,
      serviceCategories: [...w.serviceCategories], status: w.status, estateId: w.estateId
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setWorkers(ws => ws.map(w => w.id === editing.id ? { ...w, ...form } : w));
    } else {
      setWorkers(ws => [...ws, { id: `w${Date.now()}`, ...form }]);
    }
    setShowModal(false);
  };

  const toggleServiceCategory = (serviceId: string) => {
    setForm(f => ({
      ...f,
      serviceCategories: f.serviceCategories.includes(serviceId)
        ? f.serviceCategories.filter(id => id !== serviceId)
        : [...f.serviceCategories, serviceId]
    }));
  };

  const activeCount = workers.filter(w => w.status === 'active').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Workers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeCount} active · {workers.length} total workers</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Worker</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, ID, phone..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          />
        </div>
        <select
          value={estateFilter}
          onChange={e => setEstateFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="all">All Estates</option>
          {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {['all', 'active', 'inactive'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors capitalize ${statusFilter === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Estate</th>
                <th className="text-left px-4 py-3">Service Categories</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(worker => {
                const estate = estates.find(e => e.id === worker.estateId);
                const workerServices = services.filter(s => worker.serviceCategories.includes(s.id));
                return (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-medium ${worker.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-800 text-sm font-medium">{worker.name}</p>
                          <p className="text-gray-400 text-xs">{worker.gender === 'female' ? 'Female' : 'Male'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{worker.employeeId}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{worker.phone}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm max-w-32 truncate">{estate?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {workerServices.length === 0 ? (
                          <span className="text-gray-300 text-xs">None</span>
                        ) : (
                          workerServices.slice(0, 2).map(s => (
                            <span key={s.id} className="text-xs px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                              {s.name}
                            </span>
                          ))
                        )}
                        {workerServices.length > 2 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">+{workerServices.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">{worker.joinDate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${worker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(worker)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-300 hover:text-blue-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setWorkers(ws => ws.filter(w => w.id !== worker.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
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
            <div className="text-center py-16 text-gray-400">
              <UserSquare2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No workers found</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-gray-400 text-xs">{filtered.length} workers shown</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Worker' : 'Add New Worker'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Employee ID</label>
                <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Gender</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'male' | 'female' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Join Date</label>
                <input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estate</label>
                <select value={form.estateId} onChange={e => setForm(f => ({ ...f, estateId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Service Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {services.filter(s => s.status === 'active').map(s => (
                  <label key={s.id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${form.serviceCategories.includes(s.id) ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                    <input type="checkbox" checked={form.serviceCategories.includes(s.id)} onChange={() => toggleServiceCategory(s.id)} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-gray-700">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editing ? 'Save Changes' : 'Add Worker'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
