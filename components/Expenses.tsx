import { useState } from "react";
import { Estate } from "./EstateManagement";

import { useExpensesQuery, useEstatesQuery, useCreateExpenseMutation, useUpdateExpenseMutation, useDeleteExpenseMutation } from "@/hooks/hooks";

// --- Types ---
export interface Expense {
  id: string;
  date: string;
  category: "Transport" | "Tools" | "Utilities" | "Other" | string;
  description: string;
  amount: number;
  estateId: string;
  sectionId?: string;
  status: "pending" | "approved" | "rejected";
}

const CATEGORIES = ["Transport", "Tools", "Utilities", "Other"];

const badgeClasses: Record<string, string> = {
  Transport: "bg-[#FFF7ED] border-[#FFD6A8] text-[#CA3500]",
  Tools: "bg-[#EFF6FF] border-[#BEDBFF] text-[#1447E6]",
  Utilities: "bg-[#FAF5FF] border-[#E9D4FF] text-[#8200DB]",
  Other: "bg-[#F9FAFB] border-[#E5E7EB] text-[#364153]",
};

export default function Expenses() {
  const { data: serverExpenses } = useExpensesQuery();
  const { data: serverEstates } = useEstatesQuery();

  const expenses = (serverExpenses as Expense[]) || [];
  const estates = (serverEstates as Estate[]) || [];

  const createExpense = useCreateExpenseMutation();
  const updateExpense = useUpdateExpenseMutation();
  const deleteExpense = useDeleteExpenseMutation();
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal Visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form input states
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Transport");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [expenseEstateId, setExpenseEstateId] = useState("");
  const [expenseSectionId, setExpenseSectionId] = useState("");
  const [expenseStatus, setExpenseStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [formError, setFormError] = useState("");

  // Derived filtered sections list for form
  const activeEstateForm = estates.find((e) => e.id === expenseEstateId);
  const formSectionsList = activeEstateForm ? activeEstateForm.sections : [];

  // Filtered expenses list for table
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
    const matchesDate = !selectedDate || exp.date === selectedDate;

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calculate live category aggregates (excluding rejected status)
  const totalByCategory = CATEGORIES.reduce((acc, cat) => {
    const total = expenses
      .filter((e) => e.category === cat && e.status !== "rejected")
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...acc, [cat]: total };
  }, {} as Record<string, number>);

  // Live grand total and pending approval counts
  const grandTotal = expenses
    .filter((e) => e.status !== "rejected")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === "pending").length;

  // Open Add/Edit Modal
  const openModal = (exp: Expense | null = null) => {
    if (exp) {
      setEditingExpense(exp);
      setExpenseDate(exp.date);
      setExpenseCategory(exp.category);
      setExpenseDesc(exp.description);
      setExpenseAmount(exp.amount);
      setExpenseEstateId(exp.estateId);
      setExpenseSectionId(exp.sectionId || "");
      setExpenseStatus(exp.status);
    } else {
      setEditingExpense(null);
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setExpenseCategory("Transport");
      setExpenseDesc("");
      setExpenseAmount("");
      setExpenseEstateId(estates.length > 0 ? estates[0].id : "");
      setExpenseSectionId("");
      setExpenseStatus("pending");
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // Save Expense handler
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDate || !expenseDesc || !expenseEstateId) {
      setFormError("Date, Description, and Estate are required fields.");
      return;
    }
    if (expenseAmount === "" || Number(expenseAmount) <= 0) {
      setFormError("Amount must be a positive number.");
      return;
    }

    const amountNum = Number(expenseAmount);

    if (editingExpense) {
      // Edit
      updateExpense.mutate({
        id: editingExpense.id,
        payload: {
          date: expenseDate,
          category: expenseCategory,
          description: expenseDesc,
          amount: amountNum,
          estateId: expenseEstateId,
          sectionId: expenseSectionId || undefined,
          status: expenseStatus,
        }
      });
    } else {
      // Add
      const newExpense = {
        date: expenseDate,
        category: expenseCategory,
        description: expenseDesc,
        amount: amountNum,
        estateId: expenseEstateId,
        sectionId: expenseSectionId || undefined,
        status: expenseStatus,
      };
      createExpense.mutate(newExpense);
    }

    setIsModalOpen(false);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete the expense entry: "${description}"?`)) {
      deleteExpense.mutate(id);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F9FAFB]">
      {/* Workspace Panel Scroll container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        
        {/* Header Dashboard Banner */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[24px] font-medium text-[#101828] leading-[36px] font-sans">Expenses</h1>
            <p className="text-[14px] font-normal text-[#6A7282] leading-[20px] mt-0.5 font-sans">
              {pendingCount} pending approval · LKR {grandTotal.toLocaleString()} total
            </p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-[14px] rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer font-sans"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Expense</span>
          </button>
        </div>

        {/* Category Stats Summary Row */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
              className={`p-4 rounded-[14px] border cursor-pointer select-none transition-all duration-300 flex flex-col justify-center h-20 shadow-xs ${
                selectedCategory === cat
                  ? "ring-2 ring-emerald-500/20 scale-[1.01] border-emerald-400"
                  : "hover:shadow-sm"
              } ${
                cat === "Transport"
                  ? "bg-[#FFF7ED] border-[#F3F4F6]"
                  : cat === "Tools"
                  ? "bg-[#EFF6FF] border-[#F3F4F6]"
                  : cat === "Utilities"
                  ? "bg-[#FAF5FF] border-[#F3F4F6]"
                  : "bg-[#F9FAFB] border-[#F3F4F6]"
              }`}
            >
              <p
                className={`text-[12px] font-normal font-sans leading-none ${
                  cat === "Transport"
                    ? "text-[#CA3500]"
                    : cat === "Tools"
                    ? "text-[#1447E6]"
                    : cat === "Utilities"
                    ? "text-[#8200DB]"
                    : "text-[#364153]"
                }`}
              >
                {cat}
              </p>
              <p
                className={`text-[20px] font-semibold mt-1.5 leading-none font-sans ${
                  cat === "Transport"
                    ? "text-[#CA3500]"
                    : cat === "Tools"
                    ? "text-[#1447E6]"
                    : cat === "Utilities"
                    ? "text-[#8200DB]"
                    : "text-[#364153]"
                }`}
              >
                LKR {(totalByCategory[cat] || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Filters & Table Workpane Container */}
        <div className="bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
          
          {/* Table Control Filters Bar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#F3F4F6] h-16 shrink-0 bg-white">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#00A63E] rounded-[10px] pl-10 pr-3.5 text-sm outline-none transition-all placeholder-[rgba(10,10,10,0.5)] text-gray-800 font-sans"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99A1AF]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Date Input Filter */}
            <div className="relative w-[147px] shrink-0">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-[38px] px-3.5 bg-white border border-[#E5E7EB] focus:border-[#00A63E] rounded-[14px] text-sm outline-none transition-all cursor-pointer text-[#0A0A0A] font-sans font-normal"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative w-[178px] shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-[38px] px-3 bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#00A63E] rounded-[10px] text-sm outline-none transition-all cursor-pointer text-black appearance-none font-sans font-normal"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expenses Grid Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredExpenses.length > 0 ? (
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-[12px] font-bold text-[#6A7282] uppercase select-none font-sans">
                    <th className="px-6 py-3 w-[180px] tracking-[0.3px]">Category</th>
                    <th className="px-6 py-3 tracking-[0.3px]">Description</th>
                    <th className="px-6 py-3 w-[260px] tracking-[0.3px]">Estate / Section</th>
                    <th className="px-6 py-3 w-[150px] tracking-[0.3px]">Date</th>
                    <th className="px-6 py-3 w-[180px] tracking-[0.3px] text-right">Amount</th>
                    <th className="px-6 py-3 w-[120px] tracking-[0.3px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filteredExpenses.map((expense) => {
                    const estate = estates.find((e) => e.id === expense.estateId);
                    const section = estate?.sections.find((s) => s.id === expense.sectionId);

                    return (
                      <tr key={expense.id} className="hover:bg-gray-50/60 transition-colors h-[50.5px]">
                        {/* Category badge */}
                        <td className="px-6 py-3">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-[10px] border text-[12px] font-normal leading-[16px] font-sans ${badgeClasses[expense.category] || "bg-gray-50 border-gray-200 text-gray-600"}`}>
                            {expense.category}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-3 text-[14px] font-normal text-[#364153] truncate font-sans">
                          {expense.description}
                        </td>

                        {/* Estate / Section */}
                        <td className="px-6 py-3 text-[14px] font-normal text-[#6A7282] truncate font-sans">
                          {estate ? estate.name : "Unknown Estate"}
                          {section && ` · ${section.name}`}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-3 text-[14px] font-normal text-[#6A7282] whitespace-nowrap font-sans">
                          {expense.date}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-3 text-[14px] font-medium text-[#1E2939] text-right whitespace-nowrap font-sans">
                          LKR {expense.amount.toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openModal(expense)}
                              className="w-[26px] h-[26px] bg-white rounded-[10px] flex items-center justify-center text-[#99A1AF] hover:text-[#00A63E] hover:bg-emerald-50 transition-colors border border-[#E5E7EB] cursor-pointer"
                              title="Edit Expense"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id, expense.description)}
                              className="w-[26px] h-[26px] bg-white rounded-[10px] flex items-center justify-center text-[#99A1AF] hover:text-red-600 hover:bg-red-50 transition-colors border border-[#E5E7EB] cursor-pointer"
                              title="Delete Expense"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
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
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5m-18 0A1.5 1.5 0 013.75 3h16.5A1.5 1.5 0 0121.75 4.5m-18 0v11.25c0 .727.423 1.383 1.096 1.678L12 20.25l7.154-3.072a1.918 1.918 0 001.096-1.678V4.5m-18 0h18" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 mt-2 font-sans">No expenses matched filters</span>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px] font-sans">
                  Try modifying your search text, date selection, or category filters.
                </p>
              </div>
            )}
          </div>

          {/* Table Footer Stats Summary bar */}
          <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#F3F4F6] flex justify-between items-center text-xs font-semibold text-[#6A7282] select-none shrink-0 font-sans">
            <span>{filteredExpenses.length} records</span>
            <span className="text-sm font-bold text-gray-800">
              Filtered Total: LKR {filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* --- Dialog Modal: Add / Edit Expense --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 font-sans">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveExpense} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center font-sans animate-pulse">
                  {formError}
                </div>
              )}

              {/* Grid Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm outline-none transition-all text-gray-800 font-sans"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800 font-sans font-medium"
                    required
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe the expense..."
                  rows={2}
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg p-3 text-sm outline-none transition-all placeholder-gray-400 resize-none text-gray-800 font-sans"
                  required
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Amount (LKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all placeholder-gray-400 text-gray-800 font-sans"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              {/* Grid Estate & Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Estate <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expenseEstateId}
                    onChange={(e) => {
                      setExpenseEstateId(e.target.value);
                      setExpenseSectionId("");
                    }}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800 font-sans font-medium"
                    required
                  >
                    {estates.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Section (optional)
                  </label>
                  <select
                    value={expenseSectionId}
                    onChange={(e) => setExpenseSectionId(e.target.value)}
                    disabled={!expenseEstateId}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800 font-sans disabled:opacity-50 disabled:bg-gray-50"
                  >
                    <option value="">All sections</option>
                    {formSectionsList.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer font-sans"
                >
                  {editingExpense ? "Save Changes" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
