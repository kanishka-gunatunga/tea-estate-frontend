import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Shield, User as UserIcon } from 'lucide-react';
import { users as initialUsers, User, UserRole, roleLabels, roleColors, estates } from '../data/mockData';

const roleOptions: UserRole[] = ['admin', 'planter', 'supervisor', 'employee'];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'employee' as UserRole, phone: '', status: 'active' as 'active' | 'inactive', estateId: '' });

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', role: 'employee', phone: '', status: 'active', estateId: '' });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone, status: u.status, estateId: u.estateId || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editing) {
      setUsers(us => us.map(u => u.id === editing.id ? { ...u, ...form } : u));
    } else {
      const newUser: User = { id: `u${Date.now()}`, ...form, joinDate: new Date().toISOString().split('T')[0] };
      setUsers(us => [...us, newUser]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setUsers(us => us.filter(u => u.id !== id));
  };

  const roleCounts = roleOptions.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<UserRole, number>);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage system access and user roles</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add User</span>
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {roleOptions.map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${roleFilter === role ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}
          >
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block mb-2 ${roleColors[role]}`}>{roleLabels[role].split(' ')[0]}</p>
            <p className="text-2xl font-semibold text-gray-800">{roleCounts[role] || 0}</p>
            <p className="text-gray-500 text-xs mt-0.5">{roleLabels[role]}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="all">All Roles</option>
            {roleOptions.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-gray-800 text-sm font-medium">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.phone}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{user.joinDate}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <UserIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit User' : 'Add New User'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter full name" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="email@estate.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="+94 77 000 0000" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {roleOptions.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
              </div>
              {(form.role === 'planter' || form.role === 'supervisor') && (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Assigned Estate</label>
                  <select value={form.estateId} onChange={e => setForm(f => ({ ...f, estateId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    <option value="">Select estate</option>
                    {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition-colors">
                {editing ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
