import { useState } from "react";
import { Estate } from "./EstateManagement";

// --- Types ---
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Administrator" | "Planter" | "Supervisor";
  registeredDate: string;
  status: "active" | "inactive";
  assignedEstateId?: string;
}

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  estates: Estate[];
}

export default function UserManagement({ users, setUsers, estates }: UserManagementProps) {
  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userRole, setUserRole] = useState<"Administrator" | "Planter" | "Supervisor">("Supervisor");
  const [userEstateId, setUserEstateId] = useState("");
  const [userStatus, setUserStatus] = useState<"active" | "inactive">("active");
  const [formError, setFormError] = useState("");

  // Statistics calculation
  const totalUsersCount = users.length;
  const adminCount = users.filter((u) => u.role === "Administrator").length;
  const planterCount = users.filter((u) => u.role === "Planter").length;
  const supervisorCount = users.filter((u) => u.role === "Supervisor").length;

  // Filtered users for table
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // --- Handlers ---
  const openUserModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserPhone(user.phone);
      setUserRole(user.role);
      setUserEstateId(user.assignedEstateId || "");
      setUserStatus(user.status);
    } else {
      setEditingUser(null);
      setUserName("");
      setUserEmail("");
      setUserPhone("");
      setUserRole("Supervisor");
      setUserEstateId(estates.length > 0 ? estates[0].id : "");
      setUserStatus("active");
    }
    setFormError("");
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) {
      setFormError("Full Name and Email Address are required fields.");
      return;
    }

    if (editingUser) {
      // Edit User
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: userName,
                email: userEmail,
                phone: userPhone,
                role: userRole,
                assignedEstateId: userEstateId || undefined,
                status: userStatus,
              }
            : u
        )
      );
    } else {
      // Add User
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userName,
        email: userEmail,
        phone: userPhone || "+94 77 000 0000",
        role: userRole,
        registeredDate: new Date().toISOString().split("T")[0],
        status: userStatus,
        assignedEstateId: userEstateId || undefined,
      };
      setUsers((prev) => [...prev, newUser]);
    }

    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Header Dashboard Banner */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E5E7EB] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">
            User Management
          </h1>
          <p className="text-sm font-normal text-[#6A7282] mt-0.5">
            Manage system access and user roles
          </p>
        </div>
        <button
          onClick={() => openUserModal(null)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-sm rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add User</span>
        </button>
      </header>

      {/* Dashboard Content area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 gap-8">
        
        {/* Statistics Cards Grid */}
        <section className="grid grid-cols-4 gap-6 shrink-0">
          
          {/* Card: Total Users */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#364153] tracking-wide">
                Total Users
              </span>
              <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1E2939] block">{totalUsersCount}</span>
              <span className="text-xs font-medium text-[#6A7282] mt-0.5 block">System Users</span>
            </div>
          </div>

          {/* Card: Administrator */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#6E11B0] tracking-wide">
                Administrator
              </span>
              <svg className="w-4.5 h-4.5 text-[#6E11B0]/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1E2939] block">{adminCount}</span>
              <span className="text-xs font-medium text-[#6A7282] mt-0.5 block">Administrators</span>
            </div>
          </div>

          {/* Card: Planter */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#D0FAE5] text-[#006045] tracking-wide">
                Planter
              </span>
              <svg className="w-4.5 h-4.5 text-[#006045]/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1E2939] block">{planterCount}</span>
              <span className="text-xs font-medium text-[#6A7282] mt-0.5 block">Planters (Estate Owners)</span>
            </div>
          </div>

          {/* Card: Supervisor */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#193CB8] tracking-wide">
                Supervisor
              </span>
              <svg className="w-4.5 h-4.5 text-[#193CB8]/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1E2939] block">{supervisorCount}</span>
              <span className="text-xs font-medium text-[#6A7282] mt-0.5 block">Field Supervisors</span>
            </div>
          </div>

        </section>

        {/* User Management List Container */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs flex flex-col overflow-hidden">
          
          {/* Table Header Filter Row */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white">
            
            {/* Search Input */}
            <div className="relative w-96 shrink-0">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-[10px] pl-10 pr-3.5 text-sm outline-none transition-all placeholder-black/30 text-gray-800"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Role Filter Selector */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-[38px] px-3 pr-8 bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#00A63E] rounded-[10px] text-sm outline-none transition-all cursor-pointer text-gray-800 bg-none select-none"
              >
                <option value="all">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="Planter">Planter</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {filteredUsers.length > 0 ? (
              <table className="w-full min-w-[1000px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs font-bold text-[#6A7282] uppercase select-none">
                    <th className="px-6 py-3.5 tracking-wider">User</th>
                    <th className="px-6 py-3.5 tracking-wider">Role</th>
                    <th className="px-6 py-3.5 tracking-wider">Phone</th>
                    <th className="px-6 py-3.5 tracking-wider">Registered</th>
                    <th className="px-6 py-3.5 tracking-wider">Status</th>
                    <th className="px-6 py-3.5 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      
                      {/* Name & Email Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-[#05DF72] to-[#00A63E] flex items-center justify-center font-bold text-[#FFFFFF] text-sm shadow-sm">
                            {user.name.trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#1E2939] leading-tight">
                              {user.name}
                            </span>
                            <span className="text-xs text-[#99A1AF] mt-0.5 font-normal">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {user.role === "Administrator" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#6E11B0]">
                            Administrator
                          </span>
                        ) : user.role === "Planter" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D0FAE5] text-[#006045]">
                            Planter
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#193CB8]">
                            Supervisor
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-sm font-normal text-[#4A5565]">
                        {user.phone}
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 text-sm font-normal text-[#6A7282]">
                        {user.registeredDate}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            user.status === "active"
                              ? "bg-[#DCFCE7] text-[#008236]"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openUserModal(user)}
                            className="w-7 h-7 bg-[#F3F4F6] rounded-lg flex items-center justify-center text-gray-500 hover:text-[#00A63E] hover:bg-emerald-50 transition-colors border border-[#E5E7EB] cursor-pointer"
                            title="Edit User"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-7 h-7 bg-[#F3F4F6] rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-[#E5E7EB] cursor-pointer"
                            title="Delete User"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 mt-2">No users matched search</span>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                  Try modifying your search text or role filters.
                </p>
              </div>
            )}
          </div>

        </section>
      </div>

      {/* --- Dialog Modal: Add / Edit User --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@estate.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>

              {/* Grid: Phone & Role */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+94 77 000 0000"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as "Administrator" | "Planter" | "Supervisor")}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm text-black outline-none transition-all cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Planter">Planter</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
              </div>

              {/* Assigned Estate */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Assigned Estate
                </label>
                <select
                  value={userEstateId}
                  onChange={(e) => setUserEstateId(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm text-black outline-none transition-all cursor-pointer"
                >
                  <option value="">None</option>
                  {estates.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm text-black outline-none transition-all cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer"
                >
                  {editingUser ? "Save Changes" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
