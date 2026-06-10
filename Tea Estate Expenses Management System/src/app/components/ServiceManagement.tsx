import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, X, Tag, DollarSign } from 'lucide-react';
import { services as initialServices, serviceRates as initialRates, Service, ServiceRate, serviceUnits, serviceCategories } from '../data/mockData';

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

const categoryColors: Record<string, string> = {
  harvesting: 'bg-green-100 text-green-700',
  maintenance: 'bg-blue-100 text-blue-700',
  cultivation: 'bg-purple-100 text-purple-700',
  analysis: 'bg-orange-100 text-orange-700',
  transport: 'bg-gray-100 text-gray-700',
};

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [rates, setRates] = useState<ServiceRate[]>(initialRates);
  const [expandedService, setExpandedService] = useState<string | null>('sv1');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingRate, setEditingRate] = useState<ServiceRate | null>(null);
  const [rateForService, setRateForService] = useState<string>('');

  const [serviceForm, setServiceForm] = useState({ name: '', description: '', category: 'harvesting', status: 'active' as 'active' | 'inactive' });
  const [rateForm, setRateForm] = useState({ unit: 'KG', ratePerUnit: '', effectiveDate: new Date().toISOString().split('T')[0] });

  const openAddService = () => {
    setEditingService(null);
    setServiceForm({ name: '', description: '', category: 'harvesting', status: 'active' });
    setShowServiceModal(true);
  };

  const openEditService = (s: Service) => {
    setEditingService(s);
    setServiceForm({ name: s.name, description: s.description, category: s.category, status: s.status });
    setShowServiceModal(true);
  };

  const saveService = () => {
    if (!serviceForm.name) return;
    if (editingService) {
      setServices(ss => ss.map(s => s.id === editingService.id ? { ...s, ...serviceForm } : s));
    } else {
      setServices(ss => [...ss, { id: `sv${Date.now()}`, ...serviceForm }]);
    }
    setShowServiceModal(false);
  };

  const openAddRate = (serviceId: string) => {
    setEditingRate(null);
    setRateForService(serviceId);
    setRateForm({ unit: 'KG', ratePerUnit: '', effectiveDate: new Date().toISOString().split('T')[0] });
    setShowRateModal(true);
  };

  const openEditRate = (r: ServiceRate) => {
    setEditingRate(r);
    setRateForService(r.serviceId);
    setRateForm({ unit: r.unit, ratePerUnit: String(r.ratePerUnit), effectiveDate: r.effectiveDate });
    setShowRateModal(true);
  };

  const saveRate = () => {
    if (!rateForm.ratePerUnit) return;
    if (editingRate) {
      setRates(rs => rs.map(r => r.id === editingRate.id ? { ...r, ...rateForm, ratePerUnit: Number(rateForm.ratePerUnit) } : r));
    } else {
      setRates(rs => [...rs, { id: `r${Date.now()}`, serviceId: rateForService, ...rateForm, ratePerUnit: Number(rateForm.ratePerUnit) }]);
    }
    setShowRateModal(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Service Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Define services and their payment rates</p>
        </div>
        <button onClick={openAddService} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Service</span>
        </button>
      </div>

      {/* Category Summary */}
      <div className="flex flex-wrap gap-2">
        {serviceCategories.map(cat => {
          const count = services.filter(s => s.category === cat).length;
          if (count === 0) return null;
          return (
            <span key={cat} className={`text-xs px-3 py-1.5 rounded-full font-medium ${categoryColors[cat] || 'bg-gray-100 text-gray-600'}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)} · {count}
            </span>
          );
        })}
      </div>

      {/* Service List */}
      <div className="space-y-3">
        {services.map(service => {
          const serviceRatesList = rates.filter(r => r.serviceId === service.id).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
          const latestRate = serviceRatesList[0];
          const isExpanded = expandedService === service.id;

          return (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Service Header */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedService(isExpanded ? null : service.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${categoryColors[service.category]?.replace('text-', 'bg-').replace('bg-', '') || 'bg-gray-100'} bg-opacity-30`}>
                  <Tag className={`w-4 h-4 ${categoryColors[service.category]?.split(' ')[1] || 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-gray-800">{service.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[service.category] || 'bg-gray-100 text-gray-600'}`}>
                      {service.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{service.description}</p>
                </div>
                {latestRate && (
                  <div className="text-right mr-3">
                    <p className="text-green-700 text-sm font-medium">LKR {latestRate.ratePerUnit.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">per {latestRate.unit}</p>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <button onClick={e => { e.stopPropagation(); openEditService(service); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-300 hover:text-blue-500 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setServices(ss => ss.filter(s => s.id !== service.id)); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />}
                </div>
              </div>

              {/* Rates Panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Payment Rates ({serviceRatesList.length})</p>
                    <button onClick={() => openAddRate(service.id)} className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-xs font-medium transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      Add Rate
                    </button>
                  </div>

                  {serviceRatesList.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <DollarSign className="w-8 h-8 mx-auto mb-1 opacity-30" />
                      <p className="text-xs">No rates defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {serviceRatesList.map((rate, idx) => (
                        <div key={rate.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'}`}>
                          {idx === 0 && <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">Current</span>}
                          <div className="flex-1">
                            <span className="text-gray-800 text-sm font-medium">LKR {rate.ratePerUnit.toLocaleString()}</span>
                            <span className="text-gray-400 text-sm ml-1">/ {rate.unit}</span>
                          </div>
                          <span className="text-gray-400 text-xs">Effective: {rate.effectiveDate}</span>
                          <div className="flex gap-1">
                            <button onClick={() => openEditRate(rate)} className="p-1 hover:bg-blue-50 rounded-lg text-gray-300 hover:text-blue-500">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => setRates(rs => rs.filter(r => r.id !== rate.id))} className="p-1 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <Modal title={editingService ? 'Edit Service' : 'Add New Service'} onClose={() => setShowServiceModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Service Name *</label>
              <input value={serviceForm.name} onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="e.g. Leaf Plucking" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select value={serviceForm.category} onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {serviceCategories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select value={serviceForm.status} onChange={e => setServiceForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowServiceModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveService} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editingService ? 'Save Changes' : 'Add Service'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <Modal title={editingRate ? 'Edit Rate' : 'Add Payment Rate'} onClose={() => setShowRateModal(false)}>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
              Service: <strong>{services.find(s => s.id === rateForService)?.name}</strong>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Unit Type</label>
                <select value={rateForm.unit} onChange={e => setRateForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {serviceUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rate per Unit (LKR)</label>
                <input type="number" value={rateForm.ratePerUnit} onChange={e => setRateForm(f => ({ ...f, ratePerUnit: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="50.00" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Effective Date</label>
              <input type="date" value={rateForm.effectiveDate} onChange={e => setRateForm(f => ({ ...f, effectiveDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            {rateForm.ratePerUnit && rateForm.unit && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-blue-700 text-sm">Preview: <strong>LKR {Number(rateForm.ratePerUnit).toLocaleString()}</strong> per {rateForm.unit}</p>
                <p className="text-blue-500 text-xs mt-0.5">Example: 20 {rateForm.unit} × LKR {rateForm.ratePerUnit} = LKR {(20 * Number(rateForm.ratePerUnit)).toLocaleString()}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowRateModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveRate} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editingRate ? 'Save Changes' : 'Add Rate'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
