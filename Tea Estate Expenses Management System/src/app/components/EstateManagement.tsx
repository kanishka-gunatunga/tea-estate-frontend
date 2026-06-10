import { useState } from 'react';
import { Plus, MapPin, ChevronRight, X, Pencil, Trash2, Layers, Building2, ExternalLink } from 'lucide-react';
import { estates as initialEstates, sections as initialSections, Estate, Section, users } from '../data/mockData';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function EstateManagement() {
  const [estates, setEstates] = useState<Estate[]>(initialEstates);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null);
  const [showEstateModal, setShowEstateModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingEstate, setEditingEstate] = useState<Estate | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [estateForm, setEstateForm] = useState({ name: '', location: '', mapsLink: '', totalArea: '', planterId: '', supervisorId: '', established: '', status: 'active' as 'active' | 'inactive' });
  const [sectionForm, setSectionForm] = useState({ name: '', area: '', description: '' });

  const planters = users.filter(u => u.role === 'planter');
  const supervisors = users.filter(u => u.role === 'supervisor');

  const estateSections = selectedEstate ? sections.filter(s => s.estateId === selectedEstate.id) : [];

  const openAddEstate = () => {
    setEditingEstate(null);
    setEstateForm({ name: '', location: '', totalArea: '', planterId: '', supervisorId: '', established: '', status: 'active' });
    setShowEstateModal(true);
  };

  const openEditEstate = (e: Estate) => {
    setEditingEstate(e);
    setEstateForm({ name: e.name, location: e.location, mapsLink: e.mapsLink || '', totalArea: String(e.totalArea), planterId: e.planterId, supervisorId: e.supervisorId, established: e.established, status: e.status });
    setShowEstateModal(true);
  };

  const saveEstate = () => {
    if (!estateForm.name) return;
    if (editingEstate) {
      setEstates(es => es.map(e => e.id === editingEstate.id ? { ...e, ...estateForm, totalArea: Number(estateForm.totalArea), mapsLink: estateForm.mapsLink } : e));
    } else {
      const newEstate: Estate = { id: `e${Date.now()}`, ...estateForm, totalArea: Number(estateForm.totalArea), mapsLink: estateForm.mapsLink };
      setEstates(es => [...es, newEstate]);
    }
    setShowEstateModal(false);
  };

  const deleteEstate = (id: string) => {
    setEstates(es => es.filter(e => e.id !== id));
    if (selectedEstate?.id === id) setSelectedEstate(null);
  };

  const openAddSection = () => {
    setEditingSection(null);
    setSectionForm({ name: '', area: '', description: '' });
    setShowSectionModal(true);
  };

  const openEditSection = (s: Section) => {
    setEditingSection(s);
    setSectionForm({ name: s.name, area: String(s.area), description: s.description || '' });
    setShowSectionModal(true);
  };

  const saveSection = () => {
    if (!sectionForm.name || !selectedEstate) return;
    if (editingSection) {
      setSections(ss => ss.map(s => s.id === editingSection.id ? { ...s, ...sectionForm, area: Number(sectionForm.area) } : s));
    } else {
      const newSection: Section = { id: `s${Date.now()}`, ...sectionForm, area: Number(sectionForm.area), estateId: selectedEstate.id };
      setSections(ss => [...ss, newSection]);
    }
    setShowSectionModal(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Estate Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage tea estates and their sections</p>
        </div>
        <button onClick={openAddEstate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Estate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Estate List */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide px-1">Estates ({estates.length})</p>
          {estates.map(estate => {
            const planter = users.find(u => u.id === estate.planterId);
            const sectionCount = sections.filter(s => s.estateId === estate.id).length;
            const isSelected = selectedEstate?.id === estate.id;

            return (
              <div
                key={estate.id}
                onClick={() => setSelectedEstate(estate)}
                className={`bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all ${isSelected ? 'border-green-500 shadow-md' : 'border-gray-100 hover:border-green-200 shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${estate.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <h4 className="text-gray-800 truncate">{estate.name}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{estate.location}</span>
                      {estate.mapsLink && (
                        <a href={estate.mapsLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="ml-1 text-blue-500 hover:text-blue-600">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{estate.totalArea} ha</span>
                      <span>·</span>
                      <span>{sectionCount} sections</span>
                      <span>·</span>
                      <span>Est. {estate.established.split('-')[0]}</span>
                    </div>
                    {planter && <p className="text-xs text-green-600 mt-1">Planter: {planter.name}</p>}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={e => { e.stopPropagation(); openEditEstate(estate); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-300 hover:text-blue-500 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteEstate(estate.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                </div>
              </div>
            );
          })}
          {estates.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400 text-sm">No estates yet</p>
            </div>
          )}
        </div>

        {/* Sections Panel */}
        <div className="lg:col-span-3">
          {selectedEstate ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-800">{selectedEstate.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{estateSections.length} sections · {selectedEstate.totalArea} hectares total</p>
                  </div>
                  <button onClick={openAddSection} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>
              </div>

              <div className="p-4">
                {estateSections.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No sections added yet</p>
                    <button onClick={openAddSection} className="mt-3 text-green-600 text-sm hover:underline">Add first section</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {estateSections.map((section, i) => {
                      const colors = ['bg-green-50 border-green-200', 'bg-blue-50 border-blue-200', 'bg-purple-50 border-purple-200', 'bg-amber-50 border-amber-200'];
                      const textColors = ['text-green-700', 'text-blue-700', 'text-purple-700', 'text-amber-700'];
                      return (
                        <div key={section.id} className={`${colors[i % 4]} border rounded-xl p-4`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`${textColors[i % 4]} text-sm`}>{section.name}</h4>
                              <p className="text-gray-500 text-xs mt-0.5">{section.area} hectares</p>
                              {section.description && <p className="text-gray-400 text-xs mt-1">{section.description}</p>}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditSection(section)} className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-blue-500 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setSections(ss => ss.filter(s => s.id !== section.id))} className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estate Details */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Estate Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Established:</span> <span className="text-gray-700 ml-1">{selectedEstate.established}</span></div>
                  <div><span className="text-gray-400">Status:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${selectedEstate.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{selectedEstate.status}</span></div>
                  <div><span className="text-gray-400">Planter:</span> <span className="text-gray-700 ml-1">{users.find(u => u.id === selectedEstate.planterId)?.name || '—'}</span></div>
                  <div><span className="text-gray-400">Supervisor:</span> <span className="text-gray-700 ml-1">{users.find(u => u.id === selectedEstate.supervisorId)?.name || '—'}</span></div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-gray-400">Google Maps:</span>
                    {selectedEstate.mapsLink ? (
                      <a href={selectedEstate.mapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs ml-1 underline">
                        <ExternalLink className="w-3 h-3" />
                        Open in Maps
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs ml-1">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-64 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <Building2 className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Select an estate to view sections</p>
            </div>
          )}
        </div>
      </div>

      {/* Estate Modal */}
      {showEstateModal && (
        <Modal title={editingEstate ? 'Edit Estate' : 'Add New Estate'} onClose={() => setShowEstateModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estate Name *</label>
              <input value={estateForm.name} onChange={e => setEstateForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="e.g. Greenleaf Tea Estate" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Location</label>
              <input value={estateForm.location} onChange={e => setEstateForm(f => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="e.g. Nuwara Eliya, Sri Lanka" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Google Maps Link</label>
              <div className="flex gap-2">
                <input
                  value={estateForm.mapsLink}
                  onChange={e => setEstateForm(f => ({ ...f, mapsLink: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="https://maps.google.com/?q=..."
                />
                {estateForm.mapsLink && (
                  <a href={estateForm.mapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-colors whitespace-nowrap">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </a>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-1">Paste a Google Maps share link or coordinates URL</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Area (ha)</label>
                <input type="number" value={estateForm.totalArea} onChange={e => setEstateForm(f => ({ ...f, totalArea: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="450" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Established</label>
                <input type="date" value={estateForm.established} onChange={e => setEstateForm(f => ({ ...f, established: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Planter (Owner)</label>
                <select value={estateForm.planterId} onChange={e => setEstateForm(f => ({ ...f, planterId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">Select Planter</option>
                  {planters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Supervisor</label>
                <select value={estateForm.supervisorId} onChange={e => setEstateForm(f => ({ ...f, supervisorId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">Select Supervisor</option>
                  {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select value={estateForm.status} onChange={e => setEstateForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowEstateModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveEstate} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editingEstate ? 'Save Changes' : 'Add Estate'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <Modal title={editingSection ? 'Edit Section' : 'Add Section'} onClose={() => setShowSectionModal(false)}>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
              Adding to: <strong>{selectedEstate?.name}</strong>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Section Name *</label>
              <input value={sectionForm.name} onChange={e => setSectionForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="e.g. Section Alpha, North Hill" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Area (hectares)</label>
              <input type="number" value={sectionForm.area} onChange={e => setSectionForm(f => ({ ...f, area: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="80" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={sectionForm.description} onChange={e => setSectionForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" placeholder="Brief description of this section" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowSectionModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveSection} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editingSection ? 'Save Changes' : 'Add Section'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
