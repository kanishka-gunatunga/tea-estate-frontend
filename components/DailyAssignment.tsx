import { useState } from "react";
import { Estate } from "./EstateManagement";
import { Employee } from "./EmployeeManagement";
import { Service } from "./ServiceManagement";

// --- Types ---
export interface WorkerAssignment {
  employeeId: string;
  unitsCompleted: number;
  paymentAmount: number;
}

export interface DailyAssignment {
  id: string;
  date: string;
  estateId: string;
  sectionId: string;
  serviceId: string; // references service.id
  assignments: WorkerAssignment[];
  totalAmount: number;
  status: "pending" | "approved" | "completed";
}

interface DailyAssignmentProps {
  assignments: DailyAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<DailyAssignment[]>>;
  estates: Estate[];
  employees: Employee[];
  services: Service[];
}



export default function DailyAssignmentComponent({
  assignments,
  setAssignments,
  estates,
  employees,
  services,
}: DailyAssignmentProps) {
  // Date picker selection state (defaulting to 2026-06-15)
  const [selectedDate, setSelectedDate] = useState("2026-06-15");

  // New assignment inline form visibility & state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFormEstateId, setNewFormEstateId] = useState("");
  const [newFormSectionId, setNewFormSectionId] = useState("");
  const [newFormServiceId, setNewFormServiceId] = useState("");

  // Add worker inline state (per assignment ID)
  const [addWorkerForId, setAddWorkerForId] = useState<string | null>(null);
  const [addWorkerId, setAddWorkerId] = useState("");
  const [addWorkerUnits, setAddWorkerUnits] = useState<number | "">("");

  // Collapsed assignment IDs list
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

  // Editing worker units local state
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null); // e.g. "da-1_EMP001"
  const [editUnitsValue, setEditUnitsValue] = useState<number | "">("");

  // Filter assignments by selected date
  const dayAssignments = assignments.filter((a) => a.date === selectedDate);

  // Derived sections list for new assignment form
  const selectedEstateForForm = estates.find((e) => e.id === newFormEstateId);
  const formSections = selectedEstateForForm ? selectedEstateForForm.sections : [];

  // Helper: Retrieve latest rate for a service
  const getServiceRateDetails = (serviceId: string) => {
    const srv = services.find((s) => s.id === serviceId);
    return srv ? { rate: srv.rate, unit: srv.unitType } : null;
  };

  // Helper: Filter eligible workers to assign to a service
  const getEligibleWorkers = (assignment: DailyAssignment) => {
    const srv = services.find((s) => s.id === assignment.serviceId);
    if (!srv) return [];

    const alreadyAddedIds = new Set(assignment.assignments.map((a) => a.employeeId));

    return employees.filter(
      (emp) =>
        emp.status === "active" &&
        emp.estateId === assignment.estateId &&
        emp.serviceCategories.includes(srv.name) &&
        !alreadyAddedIds.has(emp.id)
    );
  };

  // Toggles collapse/expand of assignment card
  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete entire assignment
  const handleDeleteAssignment = (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Inline worker row edits
  const startEditWorker = (assignmentId: string, employeeId: string, currentUnits: number) => {
    setEditingWorkerId(`${assignmentId}_${employeeId}`);
    setEditUnitsValue(currentUnits);
  };

  const cancelEditWorker = () => {
    setEditingWorkerId(null);
    setEditUnitsValue("");
  };

  const saveEditWorker = (assignmentId: string, employeeId: string) => {
    if (editUnitsValue === "" || Number(editUnitsValue) < 0) {
      alert("Units completed must be a valid positive number.");
      return;
    }

    const unitsNum = Number(editUnitsValue);

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;

        const rateDetails = getServiceRateDetails(a.serviceId);
        const ratePerUnit = rateDetails ? rateDetails.rate : 0;

        const updatedWorkerAssignments = a.assignments.map((wa) => {
          if (wa.employeeId !== employeeId) return wa;
          const payment = Math.round(unitsNum * ratePerUnit * 100) / 100;
          return {
            ...wa,
            unitsCompleted: unitsNum,
            paymentAmount: payment,
          };
        });

        const newTotal = updatedWorkerAssignments.reduce((sum, wa) => sum + wa.paymentAmount, 0);

        return {
          ...a,
          assignments: updatedWorkerAssignments,
          totalAmount: newTotal,
        };
      })
    );

    setEditingWorkerId(null);
    setEditUnitsValue("");
  };

  // Delete worker from assignment
  const handleDeleteWorkerRow = (assignmentId: string, employeeId: string) => {
    if (confirm("Are you sure you want to remove this worker from the assignment?")) {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== assignmentId) return a;

          const updatedWorkerAssignments = a.assignments.filter((wa) => wa.employeeId !== employeeId);
          const newTotal = updatedWorkerAssignments.reduce((sum, wa) => sum + wa.paymentAmount, 0);

          return {
            ...a,
            assignments: updatedWorkerAssignments,
            totalAmount: newTotal,
          };
        })
      );
    }
  };

  // Add worker to assignment
  const handleSaveAddWorker = (assignmentId: string) => {
    if (!addWorkerId) {
      alert("Please select a worker.");
      return;
    }
    if (addWorkerUnits === "" || Number(addWorkerUnits) <= 0) {
      alert("Please specify a valid units quantity.");
      return;
    }

    const unitsNum = Number(addWorkerUnits);

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;

        const rateDetails = getServiceRateDetails(a.serviceId);
        const ratePerUnit = rateDetails ? rateDetails.rate : 0;
        const payment = Math.round(unitsNum * ratePerUnit * 100) / 100;

        const newWorkerAssignment: WorkerAssignment = {
          employeeId: addWorkerId,
          unitsCompleted: unitsNum,
          paymentAmount: payment,
        };

        const updatedWorkerAssignments = [...a.assignments, newWorkerAssignment];
        const newTotal = updatedWorkerAssignments.reduce((sum, wa) => sum + wa.paymentAmount, 0);

        return {
          ...a,
          assignments: updatedWorkerAssignments,
          totalAmount: newTotal,
        };
      })
    );

    setAddWorkerForId(null);
    setAddWorkerId("");
    setAddWorkerUnits("");
  };

  // Create new empty assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormEstateId || !newFormSectionId || !newFormServiceId) {
      alert("All fields are required to create an assignment.");
      return;
    }

    const newAssignment: DailyAssignment = {
      id: `da-${Date.now()}`,
      date: selectedDate,
      estateId: newFormEstateId,
      sectionId: newFormSectionId,
      serviceId: newFormServiceId,
      assignments: [],
      totalAmount: 0,
      status: "pending",
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setShowAddForm(false);
    setNewFormEstateId("");
    setNewFormSectionId("");
    setNewFormServiceId("");

    // Auto expand the newly created card and open add worker form
    setAddWorkerForId(newAssignment.id);
  };

  // Derived stats
  const totalDayAmount = dayAssignments.reduce((sum, a) => sum + a.totalAmount, 0);
  const totalDayWorkers = new Set(
    dayAssignments.flatMap((a) => a.assignments.map((wa) => wa.employeeId))
  ).size;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Header Dashboard Banner */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E5E7EB] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">
            Daily Assignment
          </h1>
          <p className="text-sm font-normal text-[#6A7282] mt-0.5">
            Record work assignments and calculate worker payments per day
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setShowAddForm(false);
              setAddWorkerForId(null);
            }}
            className="px-3.5 h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-[14px] text-sm outline-none transition-all bg-white text-gray-800 font-medium"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-sm rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Assignment</span>
          </button>
        </div>
      </header>

      {/* Workspace Panel */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        
        {/* Statistics Cards Row */}
        {dayAssignments.length > 0 && (
          <div className="grid grid-cols-3 gap-6 shrink-0">
            <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col">
              <span className="text-xs font-medium text-[#99A1AF] uppercase tracking-wider">
                Assignments
              </span>
              <span className="text-2xl font-bold text-[#1E2939] mt-1.5 leading-none">
                {dayAssignments.length}
              </span>
            </div>
            <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col">
              <span className="text-xs font-medium text-[#99A1AF] uppercase tracking-wider">
                Workers
              </span>
              <span className="text-2xl font-bold text-[#1E2939] mt-1.5 leading-none">
                {totalDayWorkers}
              </span>
            </div>
            <div className="bg-[#F0FDF4] border border-[#B9F8CF] rounded-2xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col">
              <span className="text-xs font-medium text-[#00A63E] uppercase tracking-wider">
                Total Payment
              </span>
              <span className="text-2xl font-bold text-[#008236] mt-1.5 leading-none">
                LKR {totalDayAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Add Assignment Expandable Form */}
        {showAddForm && (
          <div className="bg-white border-2 border-emerald-300 rounded-2xl shadow-md p-6 shrink-0">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-800">
                New Assignment for {selectedDate}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-5">
                {/* Estate Select */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Estate <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFormEstateId}
                    onChange={(e) => {
                      setNewFormEstateId(e.target.value);
                      setNewFormSectionId("");
                    }}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none cursor-pointer text-gray-800"
                    required
                  >
                    <option value="">Select estate</option>
                    {estates
                      .filter((e) => e.status === "active")
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Section Select */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFormSectionId}
                    onChange={(e) => setNewFormSectionId(e.target.value)}
                    disabled={!newFormEstateId}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none cursor-pointer text-gray-800 disabled:opacity-50 disabled:bg-gray-50"
                    required
                  >
                    <option value="">Select section</option>
                    {formSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Select */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFormServiceId}
                    onChange={(e) => setNewFormServiceId(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none cursor-pointer text-gray-800"
                    required
                  >
                    <option value="">Select service</option>
                    {services
                      .filter((s) => s.status === "active")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Rate preview if service is chosen */}
              {newFormServiceId && (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3.5 py-2.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {(() => {
                    const r = getServiceRateDetails(newFormServiceId);
                    return r ? (
                      <span>
                        Rate: <strong className="font-semibold">LKR {r.rate.toLocaleString()} / {r.unit}</strong>
                      </span>
                    ) : (
                      <span>No payment rate defined for this service</span>
                    );
                  })()}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFormEstateId || !newFormSectionId || !newFormServiceId}
                  className="px-5 py-2 bg-[#00A63E] hover:bg-[#009966] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Create & Add Workers
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assignments Accordion List */}
        <div className="flex-1 flex flex-col gap-4">
          {dayAssignments.length > 0 ? (
            dayAssignments.map((assignment) => {
              const estate = estates.find((e) => e.id === assignment.estateId);
              const section = estate?.sections.find((s) => s.id === assignment.sectionId);
              const service = services.find((s) => s.id === assignment.serviceId);
              const rateDetails = getServiceRateDetails(assignment.serviceId);

              const isCollapsed = collapsedIds.includes(assignment.id);
              const eligibleWorkers = getEligibleWorkers(assignment);

              return (
                <div
                  key={assignment.id}
                  className="bg-white border border-[#F3F4F6] rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden"
                >
                  {/* Card Header block */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6] bg-gray-50/50">
                    <button
                      onClick={() => toggleCollapse(assignment.id)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={isCollapsed ? "Expand" : "Collapse"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        {isCollapsed ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        )}
                      </svg>
                    </button>

                    <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-semibold text-sm">
                          {service ? service.name : "Unknown Service"}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize tracking-wide ${
                            assignment.status === "approved"
                              ? "bg-[#DCFCE7] text-[#008236]"
                              : assignment.status === "completed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs font-normal">
                        {estate ? estate.name : "Unknown Estate"} · {section ? section.name : "Unknown Section"}
                      </span>
                      {rateDetails && (
                        <span className="text-gray-400 text-xs font-normal font-mono">
                          LKR {rateDetails.rate.toLocaleString()}/{rateDetails.unit}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-normal">
                          {assignment.assignments.length} workers
                        </p>
                        <p className="text-[#008236] font-bold text-sm">
                          LKR {assignment.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all cursor-pointer"
                        title="Delete Assignment"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded block */}
                  {!isCollapsed && (
                    <div className="p-5 flex flex-col gap-4">
                      
                      {/* Worker table */}
                      {assignment.assignments.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 text-[10px] font-bold text-[#6A7282] uppercase select-none">
                                <th className="px-4 py-2.5">Worker</th>
                                <th className="px-4 py-2.5">Emp ID</th>
                                <th className="px-4 py-2.5 text-center">Units ({rateDetails?.unit || "—"})</th>
                                <th className="px-4 py-2.5 text-right">Payment (LKR)</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {assignment.assignments.map((row) => {
                                const emp = employees.find((e) => e.id === row.employeeId);
                                
                                const isRowEditing = editingWorkerId === `${assignment.id}_${row.employeeId}`;
                                const isFemale = emp?.gender === "Female";
                                const avatarBg = isFemale ? "bg-[#FCE7F3]" : "bg-[#DBEAFE]";
                                const avatarText = isFemale ? "text-[#E60076]" : "text-[#155DFC]";

                                const previewPay = isRowEditing && editUnitsValue !== ""
                                  ? Math.round(Number(editUnitsValue) * (rateDetails?.rate || 0) * 100) / 100
                                  : null;

                                return (
                                  <tr key={row.employeeId} className="hover:bg-gray-50/50 text-sm">
                                    {/* Worker details */}
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg ${avatarBg} ${avatarText} flex items-center justify-center font-bold text-xs select-none shrink-0`}>
                                          {emp ? emp.name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <span className="font-semibold text-[#1E2939]">
                                          {emp ? emp.name : "Unknown Employee"}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Employee ID */}
                                    <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500">
                                      {row.employeeId}
                                    </td>

                                    {/* Units */}
                                    <td className="px-4 py-3 text-center">
                                      {isRowEditing ? (
                                        <input
                                          type="number"
                                          value={editUnitsValue}
                                          onChange={(e) =>
                                            setEditUnitsValue(
                                              e.target.value === "" ? "" : Number(e.target.value)
                                            )
                                          }
                                          min="0"
                                          step="0.5"
                                          className="w-20 h-8 text-center border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 rounded-lg text-sm bg-white text-gray-800 font-medium"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="font-medium text-gray-700">
                                          {row.unitsCompleted}
                                        </span>
                                      )}
                                    </td>

                                    {/* Payment */}
                                    <td className="px-4 py-3 text-right text-[#008236] font-semibold">
                                      {isRowEditing && previewPay !== null ? (
                                        <span>{previewPay.toLocaleString()}</span>
                                      ) : (
                                        <span>{row.paymentAmount.toLocaleString()}</span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right">
                                      <div className="inline-flex items-center gap-1.5">
                                        {isRowEditing ? (
                                          <>
                                            <button
                                              onClick={() => saveEditWorker(assignment.id, row.employeeId)}
                                              className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                                              title="Save"
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={cancelEditWorker}
                                              className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-lg border border-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                                              title="Cancel"
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() =>
                                                startEditWorker(
                                                  assignment.id,
                                                  row.employeeId,
                                                  row.unitsCompleted
                                                )
                                              }
                                              className="w-7 h-7 bg-[#F3F4F6] hover:bg-emerald-50 text-gray-400 hover:text-[#00A63E] rounded-lg border border-[#D1D5DC] flex items-center justify-center transition-colors cursor-pointer"
                                              title="Edit units"
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteWorkerRow(assignment.id, row.employeeId)
                                              }
                                              className="w-7 h-7 bg-[#F3F4F6] hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg border border-[#D1D5DC] flex items-center justify-center transition-colors cursor-pointer"
                                              title="Remove worker"
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
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
                              <tr className="bg-[#F9FAFB] text-sm border-t border-gray-100">
                                <td colSpan={3} className="px-4 py-2.5 text-gray-500 font-medium select-none">
                                  Total
                                </td>
                                <td className="px-4 py-2.5 text-right text-[#008236] font-bold">
                                  LKR {assignment.totalAmount.toLocaleString()}
                                </td>
                                <td />
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                          No workers assigned. Add a worker below.
                        </div>
                      )}

                      {/* Add Worker Inline block */}
                      {addWorkerForId === assignment.id ? (
                        <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-emerald-200">
                          {/* Eligible workers dropdown */}
                          <select
                            value={addWorkerId}
                            onChange={(e) => setAddWorkerId(e.target.value)}
                            className="flex-1 h-9 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-2 text-xs outline-none cursor-pointer text-gray-800"
                          >
                            <option value="">Select worker</option>
                            {eligibleWorkers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.id})
                              </option>
                            ))}
                          </select>

                          {/* Units completed input */}
                          <input
                            type="number"
                            placeholder={`Units (${rateDetails?.unit || "—"})`}
                            value={addWorkerUnits}
                            onChange={(e) =>
                              setAddWorkerUnits(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            min="0.01"
                            step="0.5"
                            className="w-36 h-9 px-3 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg text-xs text-gray-800 outline-none"
                          />

                          {/* Payment calculation preview */}
                          {addWorkerUnits !== "" && rateDetails && (
                            <span className="text-xs font-semibold text-[#008236] whitespace-nowrap">
                              = LKR {(Number(addWorkerUnits) * rateDetails.rate).toLocaleString()}
                            </span>
                          )}

                          <button
                            onClick={() => handleSaveAddWorker(assignment.id)}
                            disabled={!addWorkerId || addWorkerUnits === ""}
                            className="px-3.5 h-9 bg-[#00A63E] hover:bg-[#009966] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAddWorkerForId(null);
                              setAddWorkerId("");
                              setAddWorkerUnits("");
                            }}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-start mt-2">
                          <button
                            onClick={() => {
                              setAddWorkerForId(assignment.id);
                              setAddWorkerId("");
                              setAddWorkerUnits("");
                            }}
                            disabled={eligibleWorkers.length === 0}
                            className="flex items-center gap-1 text-sm font-semibold text-[#00A63E] hover:text-[#009966] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {eligibleWorkers.length === 0
                              ? "No more eligible workers"
                              : "Add Worker"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-[#E5E7EB] rounded-2xl">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-sm font-semibold text-gray-600 mt-2">
                No assignments for {selectedDate}
              </span>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Click &quot;Add Assignment&quot; to configure worker payroll entries for this date.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
