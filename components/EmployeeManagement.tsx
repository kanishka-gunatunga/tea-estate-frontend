import { useState } from "react";
import { Estate } from "./EstateManagement";
import { Service } from "./ServiceManagement";

// --- Types ---
export interface Employee {
  id: string; // e.g. EMP001
  name: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  estateId: string;
  serviceCategories: string[];
  nic: string;
  status: "active" | "inactive";
}

interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  estates: Estate[];
  services: Service[];
}

export default function EmployeeManagement({
  employees,
  setEmployees,
  estates,
  services,
}: EmployeeManagementProps) {
  // Get categories dynamically from services list
  const SERVICE_CATEGORIES = services.map((s) => s.name);
  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [estateFilter, setEstateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [empName, setEmpName] = useState("");
  const [empId, setEmpId] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empGender, setEmpGender] = useState<"Male" | "Female" | "Other">("Male");
  const [empCategories, setEmpCategories] = useState<string[]>([]);
  const [empNic, setEmpNic] = useState("");
  const [empEstateId, setEmpEstateId] = useState("");
  const [empStatus, setEmpStatus] = useState<"active" | "inactive">("active");
  const [formError, setFormError] = useState("");

  // Statistics calculation
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === "active").length;

  // Filtered employees for table
  const filteredEmployees = employees.filter((emp) => {
    // 1. Search Query
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery);

    // 2. Estate filter
    const matchesEstate = estateFilter === "all" || emp.estateId === estateFilter;

    // 3. Category filter
    const matchesCategory =
      categoryFilter === "all" || emp.serviceCategories.includes(categoryFilter);

    // 4. Status button selector filter
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;

    return matchesSearch && matchesEstate && matchesCategory && matchesStatus;
  });

  // Toggle category in checkboxes
  const handleToggleCategory = (category: string) => {
    setEmpCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Open Add / Edit Form Modal
  const openEmployeeModal = (emp: Employee | null = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmpName(emp.name);
      setEmpId(emp.id);
      setEmpPhone(emp.phone);
      setEmpGender(emp.gender);
      setEmpCategories(emp.serviceCategories);
      setEmpNic(emp.nic);
      setEmpEstateId(emp.estateId);
      setEmpStatus(emp.status);
    } else {
      // Auto generate EMP Code
      const nextNum = employees.reduce((max, e) => {
        const num = parseInt(e.id.replace("EMP", ""), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0) + 1;
      const autoId = `EMP${String(nextNum).padStart(3, "0")}`;

      setEditingEmployee(null);
      setEmpName("");
      setEmpId(autoId);
      setEmpPhone("");
      setEmpGender("Male");
      setEmpCategories([]);
      setEmpNic("");
      setEmpEstateId(estates.length > 0 ? estates[0].id : "");
      setEmpStatus("active");
    }
    setFormError("");
    setIsEmployeeModalOpen(true);
  };

  // Save Employee (Add or Edit)
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empNic || !empEstateId) {
      setFormError("Full Name, NIC, and Estate are required fields.");
      return;
    }
    if (empCategories.length === 0) {
      setFormError("Please select at least one Service Category.");
      return;
    }

    if (editingEmployee) {
      // Edit
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id
            ? {
              ...e,
              name: empName,
              id: empId,
              phone: empPhone,
              gender: empGender,
              serviceCategories: empCategories,
              nic: empNic,
              estateId: empEstateId,
              status: empStatus,
            }
            : e
        )
      );
    } else {
      // Add
      const newEmp: Employee = {
        id: empId || `EMP${String(employees.length + 1).padStart(3, "0")}`,
        name: empName,
        gender: empGender,
        phone: empPhone || "+94 77 000 0000",
        estateId: empEstateId,
        serviceCategories: empCategories,
        nic: empNic,
        status: empStatus,
      };
      setEmployees((prev) => [...prev, newEmp]);
    }

    setIsEmployeeModalOpen(false);
  };

  // Delete Employee
  const handleDeleteEmployee = (empIdToDelete: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      setEmployees((prev) => prev.filter((e) => e.id !== empIdToDelete));
    }
  };

  // Truncated categories display logic
  const renderCategories = (categories: string[]) => {
    if (categories.length <= 2) {
      return categories.map((cat, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-[#F0FDF4] text-[#008236] border border-[#DCFCE7] capitalize whitespace-nowrap"
        >
          {cat}
        </span>
      ));
    }
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {categories.slice(0, 2).map((cat, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-[#F0FDF4] text-[#008236] border border-[#DCFCE7] capitalize whitespace-nowrap"
          >
            {cat}
          </span>
        ))}
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          +{categories.length - 2}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-y-auto bg-[#F9FAFB] p-6 gap-5 font-sans">
      {/* Header Dashboard Banner */}
      <div className="flex items-center justify-between shrink-0 no-print">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828] leading-[36px]">
            Employee Management
          </h1>
          <p className="text-sm font-normal text-[#6A7282] mt-0.5">
            {activeEmployeesCount} active · {totalEmployeesCount} total Employee
          </p>
        </div>
        <button
          onClick={() => openEmployeeModal(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-sm rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Row Block */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap no-print">

        {/* Search Input */}
        <div className="relative w-[384px] shrink-0">
          <input
            type="text"
            placeholder="Search name, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[42px] bg-white border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-[14px] pl-10 pr-3.5 text-sm text-black outline-none transition-all placeholder-[#99A1AF]"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#99A1AF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Estates Dropdown Filter */}
        <div className="relative w-[178px] shrink-0">
          <select
            value={estateFilter}
            onChange={(e) => setEstateFilter(e.target.value)}
            className="w-full h-[42px] pl-3.5 pr-8 bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#00A63E] rounded-lg text-sm text-black outline-none transition-all cursor-pointer select-none appearance-none"
          >
            <option value="all">All Estates</option>
            {estates.map((est) => (
              <option key={est.id} value={est.id}>
                {est.name}
              </option>
            ))}
          </select>
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Category Dropdown Filter */}
        <div className="relative w-[178px] shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-[42px] pl-3.5 pr-8 bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#00A63E] rounded-lg text-sm text-black outline-none transition-all cursor-pointer select-none appearance-none"
          >
            <option value="all">All Categories</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Status Tab buttons */}
        <div className="bg-[#F3F4F6] rounded-[14px] p-1 flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg select-none cursor-pointer transition-all ${statusFilter === "all"
              ? "bg-white text-[#1E2939] shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
              : "text-[#6A7282] hover:text-[#1E2939]"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg select-none cursor-pointer transition-all ${statusFilter === "active"
              ? "bg-white text-[#1E2939] shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
              : "text-[#6A7282] hover:text-[#1E2939]"
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg select-none cursor-pointer transition-all ${statusFilter === "inactive"
              ? "bg-white text-[#1E2939] shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
              : "text-[#6A7282] hover:text-[#1E2939]"
              }`}
          >
            Inactive
          </button>
        </div>

      </div>

      {/* Dashboard Table Workspace */}
      <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-sm overflow-hidden flex flex-col shrink-0">

        <div className="overflow-x-auto">
          {filteredEmployees.length > 0 ? (
            <table className="w-full min-w-[1100px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-xs font-bold text-[#6A7282] uppercase select-none h-[40.5px]">
                  <th className="px-6 py-3 tracking-wider">Employee</th>
                  <th className="px-6 py-3 tracking-wider">ID</th>
                  <th className="px-6 py-3 tracking-wider">Phone</th>
                  <th className="px-6 py-3 tracking-wider">Estate</th>
                  <th className="px-6 py-3 tracking-wider">Service Categories</th>
                  <th className="px-6 py-3 tracking-wider">Registered</th>
                  <th className="px-6 py-3 tracking-wider">Status</th>
                  <th className="px-6 py-3 tracking-wider text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => {
                  const assignedEstate = estates.find((est) => est.id === emp.estateId);

                  // Gender color coding
                  const isFemale = emp.gender === "Female";
                  const avatarBg = isFemale ? "bg-[#FCE7F3]" : "bg-[#DBEAFE]";
                  const avatarText = isFemale ? "text-[#E60076]" : "text-[#155DFC]";

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors border-b border-[#F9FAFB] h-[61px]">

                      {/* Name and Gender Subtitle */}
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${avatarBg} ${avatarText} flex items-center justify-center font-bold text-sm select-none shrink-0 shadow-xs`}>
                            {emp.name.trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#1E2939] leading-tight">
                              {emp.name}
                            </span>
                            <span className="text-xs text-[#99A1AF] mt-0.5 font-normal capitalize">
                              {emp.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-6 py-2.5 text-sm font-normal text-[#4A5565]">
                        {emp.id}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-2.5 text-sm font-normal text-[#4A5565]">
                        {emp.phone}
                      </td>

                      {/* Assigned Estate */}
                      <td className="px-6 py-2.5 text-sm font-normal text-[#4A5565]">
                        {assignedEstate ? assignedEstate.name : "None"}
                      </td>

                      {/* Service Categories */}
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {renderCategories(emp.serviceCategories)}
                        </div>
                      </td>

                      {/* NIC as Registered Column */}
                      <td className="px-6 py-2.5 text-sm font-normal text-gray-500">
                        {emp.nic}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal capitalize ${emp.status === "active"
                            ? "bg-[#DCFCE7] text-[#008236] border border-transparent"
                            : "bg-gray-100 text-gray-500 border border-transparent"
                            }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2.5 text-right pr-8">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEmployeeModal(emp)}
                            className="w-[26px] h-[26px] bg-transparent hover:bg-emerald-50 rounded-lg flex items-center justify-center text-[#D1D5DC] hover:text-[#00A63E] transition-colors border-none cursor-pointer"
                            title="Edit Employee"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="w-[26px] h-[26px] bg-transparent hover:bg-red-50 rounded-lg flex items-center justify-center text-[#D1D5DC] hover:text-red-500 transition-colors border-none cursor-pointer"
                            title="Delete Employee"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0112.75 21.5h-1.5a2.25 2.25 0 01-2.25-2.263V19.13m4.75-3.07a9.3 9.3 0 00-4.75 1.07M4 19.128C1.196 18.005 0 15 0 15h9.156m-1.37-3.07a9.3 9.3 0 00-4.75 1.07M10.5 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-600 mt-2">No employees matched filters</span>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                Try modifying your search text, estate selection, or category filters.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#F3F4F6] text-xs font-semibold text-[#6A7282] select-none">
          {filteredEmployees.length} Employees shown
        </div>

      </div>

      {/* --- Dialog Modal: Add / Edit Employee --- */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEmployee} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                  {formError}
                </div>
              )}

              {/* Full Name & Employee ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full h-10 bg-white border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="EMP009"
                    value={empId}
                    disabled
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full h-10 bg-gray-50 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Phone & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+94 77 000 0000"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full h-10 bg-white border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={empGender}
                    onChange={(e) => setEmpGender(e.target.value as "Male" | "Female" | "Other")}
                    className="w-full h-10 bg-white border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm text-gray-900 outline-none transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Service Categories Checkbox selector list */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Service Categories <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2.5 p-3 border border-gray-200 rounded-lg bg-[#F9FAFB] max-h-32 overflow-y-auto">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isChecked = empCategories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCategory(cat)}
                          className="w-4 h-4 accent-[#00A63E] cursor-pointer rounded"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* NIC & Estate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    NIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="453213234v"
                    value={empNic}
                    onChange={(e) => setEmpNic(e.target.value)}
                    className="w-full h-10 bg-white border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Estate <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={empEstateId}
                    onChange={(e) => setEmpEstateId(e.target.value)}
                    className="w-full h-10 bg-white border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm text-gray-900 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select Estate</option>
                    {estates.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={empStatus}
                  onChange={(e) => setEmpStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-10 bg-white border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm text-gray-900 outline-none transition-all cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer"
                >
                  {editingEmployee ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
