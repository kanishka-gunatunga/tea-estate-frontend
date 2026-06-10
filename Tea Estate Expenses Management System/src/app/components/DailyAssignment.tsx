import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, Check, X, ClipboardList, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import {
  estates, sections, services, serviceRates, workers,
  dailyAssignments as initialAssignments,
  DailyAssignment as DailyAssignmentData,
  WorkerAssignment
} from '../data/mockData';

interface WorkerRow extends WorkerAssignment {
  editing: boolean;
  editUnits: number;
}

interface AssignmentWithRows extends DailyAssignmentData {
  workerRows: WorkerRow[];
  collapsed: boolean;
}

function buildRows(assignment: DailyAssignmentData): WorkerRow[] {
  return assignment.assignments.map(a => ({
    ...a,
    editing: false,
    editUnits: a.unitsCompleted,
  }));
}

export function DailyAssignment() {
  const [date, setDate] = useState('2026-05-30');
  const [allAssignments, setAllAssignments] = useState<AssignmentWithRows[]>(
    initialAssignments.map(a => ({ ...a, workerRows: buildRows(a), collapsed: false }))
  );

  // New assignment form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({ estateId: '', sectionId: '', serviceId: '' });

  // Add worker form per assignment
  const [addWorkerFor, setAddWorkerFor] = useState<string | null>(null);
  const [addWorkerForm, setAddWorkerForm] = useState({ workerId: '', units: '' });

  const dayAssignments = allAssignments.filter(a => a.date === date);

  // Derived selectors for new assignment form
  const formSections = useMemo(() => sections.filter(s => s.estateId === newForm.estateId), [newForm.estateId]);
  const formServices = useMemo(() => services.filter(s => s.status === 'active'), []);

  const getLatestRate = (serviceId: string) => {
    const rates = serviceRates.filter(r => r.serviceId === serviceId).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    return rates[0] || null;
  };

  const getEligibleWorkers = (assignment: AssignmentWithRows) => {
    const alreadyAdded = new Set(assignment.workerRows.map(r => r.workerId));
    return workers.filter(w =>
      w.status === 'active' &&
      w.estateId === assignment.estateId &&
      w.serviceCategories.includes(assignment.serviceId) &&
      !alreadyAdded.has(w.id)
    );
  };

  // Toggle collapse
  const toggleCollapse = (id: string) => {
    setAllAssignments(as => as.map(a => a.id === id ? { ...a, collapsed: !a.collapsed } : a));
  };

  // Delete assignment
  const deleteAssignment = (id: string) => {
    setAllAssignments(as => as.filter(a => a.id !== id));
  };

  // Start editing a worker row
  const startEdit = (assignmentId: string, workerId: string) => {
    setAllAssignments(as => as.map(a => {
      if (a.id !== assignmentId) return a;
      return { ...a, workerRows: a.workerRows.map(r => r.workerId === workerId ? { ...r, editing: true, editUnits: r.unitsCompleted } : r) };
    }));
  };

  // Save edited row
  const saveEdit = (assignmentId: string, workerId: string) => {
    setAllAssignments(as => as.map(a => {
      if (a.id !== assignmentId) return a;
      const rate = getLatestRate(a.serviceId);
      const ratePerUnit = rate?.ratePerUnit || 0;
      const updatedRows = a.workerRows.map(r => {
        if (r.workerId !== workerId) return r;
        const payment = Math.round(r.editUnits * ratePerUnit * 100) / 100;
        return { ...r, editing: false, unitsCompleted: r.editUnits, paymentAmount: payment };
      });
      const totalAmount = updatedRows.reduce((s, r) => s + r.paymentAmount, 0);
      return { ...a, workerRows: updatedRows, totalAmount, assignments: updatedRows.map(r => ({ workerId: r.workerId, unitsCompleted: r.unitsCompleted, paymentAmount: r.paymentAmount })) };
    }));
  };

  // Cancel edit
  const cancelEdit = (assignmentId: string, workerId: string) => {
    setAllAssignments(as => as.map(a => {
      if (a.id !== assignmentId) return a;
      return { ...a, workerRows: a.workerRows.map(r => r.workerId === workerId ? { ...r, editing: false } : r) };
    }));
  };

  // Update edit units
  const setEditUnits = (assignmentId: string, workerId: string, units: number) => {
    setAllAssignments(as => as.map(a => {
      if (a.id !== assignmentId) return a;
      return { ...a, workerRows: a.workerRows.map(r => r.workerId === workerId ? { ...r, editUnits: units } : r) };
    }));
  };

  // Delete worker row
  const deleteWorkerRow = (assignmentId: string, workerId: string) => {
    setAllAssignments(as => as.map(a => {
      if (a.id !== assignmentId) return a;
      const updatedRows = a.workerRows.filter(r => r.workerId !== workerId);
      const totalAmount = updatedRows.reduce((s, r) => s + r.paymentAmount, 0);
      return { ...a, workerRows: updatedRows, totalAmount, assignments: updatedRows.map(r => ({ workerId: r.workerId, unitsCompleted: r.unitsCompleted, paymentAmount: r.paymentAmount })) };
    }));
  };

  // Add worker to assignment
  const handleAddWorker = (assignmentId: string) => {
    if (!addWorkerForm.workerId || !addWorkerForm.units) return;
    setAllAssignments(as => as.map(a => {
      if (a.id !== assignmentId) return a;
      const rate = getLatestRate(a.serviceId);
      const payment = Math.round(Number(addWorkerForm.units) * (rate?.ratePerUnit || 0) * 100) / 100;
      const newRow: WorkerRow = {
        workerId: addWorkerForm.workerId,
        unitsCompleted: Number(addWorkerForm.units),
        paymentAmount: payment,
        editing: false,
        editUnits: Number(addWorkerForm.units),
      };
      const updatedRows = [...a.workerRows, newRow];
      const totalAmount = updatedRows.reduce((s, r) => s + r.paymentAmount, 0);
      return { ...a, workerRows: updatedRows, totalAmount, assignments: updatedRows.map(r => ({ workerId: r.workerId, unitsCompleted: r.unitsCompleted, paymentAmount: r.paymentAmount })) };
    }));
    setAddWorkerFor(null);
    setAddWorkerForm({ workerId: '', units: '' });
  };

  // Create new assignment
  const handleCreateAssignment = () => {
    if (!newForm.estateId || !newForm.sectionId || !newForm.serviceId) return;
    const rate = getLatestRate(newForm.serviceId);
    const newAssignment: AssignmentWithRows = {
      id: `da${Date.now()}`,
      date,
      estateId: newForm.estateId,
      sectionId: newForm.sectionId,
      serviceId: newForm.serviceId,
      serviceRateId: rate?.id || '',
      assignments: [],
      totalAmount: 0,
      status: 'pending',
      createdBy: 'u4',
      workerRows: [],
      collapsed: false,
    };
    setAllAssignments(as => [...as, newAssignment]);
    setShowAddForm(false);
    setNewForm({ estateId: '', sectionId: '', serviceId: '' });
    setAddWorkerFor(newAssignment.id);
  };

  const totalDayAmount = dayAssignments.reduce((s, a) => s + a.totalAmount, 0);
  const totalDayWorkers = new Set(dayAssignments.flatMap(a => a.workerRows.map(r => r.workerId))).size;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-900">Daily Assignment</h1>
          <p className="text-gray-500 text-sm mt-0.5">Record work assignments and calculate worker payments per day</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setShowAddForm(false); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Day Summary Bar */}
      {dayAssignments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-gray-400 text-xs">Assignments</p>
            <p className="text-gray-800 text-xl font-semibold mt-0.5">{dayAssignments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-gray-400 text-xs">Workers</p>
            <p className="text-gray-800 text-xl font-semibold mt-0.5">{totalDayWorkers}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm">
            <p className="text-green-600 text-xs">Total Payment</p>
            <p className="text-green-700 text-xl font-semibold mt-0.5">LKR {totalDayAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Add New Assignment Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border-2 border-green-300 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">New Assignment for {date}</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Estate *</label>
              <select
                value={newForm.estateId}
                onChange={e => setNewForm(f => ({ ...f, estateId: e.target.value, sectionId: '' }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                <option value="">Select estate</option>
                {estates.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Section *</label>
              <select
                value={newForm.sectionId}
                onChange={e => setNewForm(f => ({ ...f, sectionId: e.target.value }))}
                disabled={!newForm.estateId}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white disabled:opacity-50"
              >
                <option value="">Select section</option>
                {formSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Service *</label>
              <select
                value={newForm.serviceId}
                onChange={e => setNewForm(f => ({ ...f, serviceId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                <option value="">Select service</option>
                {formServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {newForm.serviceId && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2">
              <Calculator className="w-4 h-4 flex-shrink-0" />
              {(() => {
                const rate = getLatestRate(newForm.serviceId);
                return rate ? <span>Rate: <strong>LKR {rate.ratePerUnit.toLocaleString()} / {rate.unit}</strong> (effective {rate.effectiveDate})</span> : <span>No rate defined</span>;
              })()}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleCreateAssignment}
              disabled={!newForm.estateId || !newForm.sectionId || !newForm.serviceId}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm transition-colors"
            >
              Create & Add Workers
            </button>
          </div>
        </div>
      )}

      {/* Assignment Cards */}
      {dayAssignments.length === 0 && !showAddForm ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No assignments for {date}</p>
          <button onClick={() => setShowAddForm(true)} className="mt-3 text-green-600 text-sm hover:underline">Add first assignment</button>
        </div>
      ) : (
        <div className="space-y-4">
          {dayAssignments.map(assignment => {
            const estate = estates.find(e => e.id === assignment.estateId);
            const section = sections.find(s => s.id === assignment.sectionId);
            const service = services.find(s => s.id === assignment.serviceId);
            const rate = getLatestRate(assignment.serviceId);
            const eligibleWorkers = getEligibleWorkers(assignment);

            return (
              <div key={assignment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Assignment Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <button onClick={() => toggleCollapse(assignment.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    {assignment.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-medium text-sm">{service?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        assignment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        assignment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{assignment.status}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{estate?.name} · {section?.name}</span>
                    {rate && <span className="text-gray-400 text-xs">LKR {rate.ratePerUnit}/{rate.unit}</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{assignment.workerRows.length} workers</p>
                      <p className="text-green-700 font-semibold text-sm">LKR {assignment.totalAmount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!assignment.collapsed && (
                  <div className="p-4 space-y-3">
                    {/* Worker Table */}
                    {assignment.workerRows.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="text-xs text-gray-400 uppercase bg-gray-50 rounded-xl">
                            <tr>
                              <th className="text-left px-3 py-2">Worker</th>
                              <th className="text-left px-3 py-2">Emp ID</th>
                              <th className="text-center px-3 py-2">Units ({rate?.unit || '—'})</th>
                              <th className="text-right px-3 py-2">Payment (LKR)</th>
                              <th className="px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {assignment.workerRows.map(row => {
                              const worker = workers.find(w => w.id === row.workerId);
                              const previewPayment = row.editing ? Math.round(row.editUnits * (rate?.ratePerUnit || 0) * 100) / 100 : null;
                              return (
                                <tr key={row.workerId} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium ${worker?.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {worker?.name.charAt(0)}
                                      </div>
                                      <span className="text-gray-800 text-sm">{worker?.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{worker?.employeeId}</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    {row.editing ? (
                                      <input
                                        type="number"
                                        value={row.editUnits || ''}
                                        onChange={e => setEditUnits(assignment.id, row.workerId, Number(e.target.value))}
                                        min={0}
                                        step={0.5}
                                        autoFocus
                                        className="w-20 px-2 py-1 border border-green-400 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
                                      />
                                    ) : (
                                      <span className="text-gray-700 text-sm">{row.unitsCompleted}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-right">
                                    {row.editing && previewPayment !== null ? (
                                      <span className="text-green-600 text-sm font-medium">{previewPayment.toLocaleString()}</span>
                                    ) : (
                                      <span className="text-green-700 text-sm font-medium">{row.paymentAmount.toLocaleString()}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-1 justify-end">
                                      {row.editing ? (
                                        <>
                                          <button onClick={() => saveEdit(assignment.id, row.workerId)} className="p-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors">
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => cancelEdit(assignment.id, row.workerId)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button onClick={() => startEdit(assignment.id, row.workerId)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-300 hover:text-blue-500 transition-colors">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => deleteWorkerRow(assignment.id, row.workerId)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-gray-200 bg-green-50/50">
                              <td colSpan={3} className="px-3 py-2 text-sm text-gray-500">Total</td>
                              <td className="px-3 py-2 text-right text-green-700 font-semibold text-sm">
                                {assignment.totalAmount.toLocaleString()}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {/* Add Worker Row */}
                    {addWorkerFor === assignment.id ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        <select
                          value={addWorkerForm.workerId}
                          onChange={e => setAddWorkerForm(f => ({ ...f, workerId: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                        >
                          <option value="">Select worker</option>
                          {eligibleWorkers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.employeeId})</option>)}
                        </select>
                        <input
                          type="number"
                          value={addWorkerForm.units}
                          onChange={e => setAddWorkerForm(f => ({ ...f, units: e.target.value }))}
                          placeholder={`Units (${rate?.unit || '—'})`}
                          min={0}
                          step={0.5}
                          className="w-36 px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        {addWorkerForm.units && rate && (
                          <span className="text-green-700 text-sm whitespace-nowrap">
                            = LKR {(Number(addWorkerForm.units) * rate.ratePerUnit).toLocaleString()}
                          </span>
                        )}
                        <button onClick={() => handleAddWorker(assignment.id)} disabled={!addWorkerForm.workerId || !addWorkerForm.units} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-sm transition-colors">
                          Add
                        </button>
                        <button onClick={() => { setAddWorkerFor(null); setAddWorkerForm({ workerId: '', units: '' }); }} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddWorkerFor(assignment.id); setAddWorkerForm({ workerId: '', units: '' }); }}
                        disabled={eligibleWorkers.length === 0}
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {eligibleWorkers.length === 0 ? 'No more eligible workers' : 'Add Worker'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
