"use client";

import { useState, useEffect } from "react";
import { Database, Download, Trash2, Clock, ChevronDown, Check, Loader2, FileSpreadsheet, HardDrive } from "lucide-react";
import { Estate } from "@/components/EstateManagement";
import { User } from "@/components/UserManagement";
import { Employee } from "@/components/EmployeeManagement";
import { Service } from "@/components/ServiceManagement";
import { DailyAssignment } from "@/components/DailyAssignment";
import { Expense } from "@/components/Expenses";
import { useBackupsQuery, useCreateBackupMutation, useDeleteBackupMutation } from "@/hooks/hooks";
import { api } from "@/services/api";

interface BackupRecord {
  id: string;
  filename: string;
  createdAt: string;
  type: "Auto" | "Manual";
  sizeKB: number;
  records: number | null;
  status: "success" | "failed";
}

interface BackupsProps {
  estates: Estate[];
  users: User[];
  employees: Employee[];
  services: Service[];
  expenses: Expense[];
  assignments: DailyAssignment[];
}

export default function Backups({
  estates,
  users,
  employees,
  services,
  expenses,
  assignments,
}: BackupsProps) {
  const { data: serverBackups } = useBackupsQuery();
  const createBackupMutation = useCreateBackupMutation();
  const deleteBackupMutation = useDeleteBackupMutation();

  const [backups, setBackups] = useState<BackupRecord[]>([]);

  useEffect(() => {
    if (serverBackups) {
      setBackups(serverBackups as any);
    }
  }, [serverBackups]);

  // Scheduler configuration states
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(true);
  const [autoBackupSchedule, setAutoBackupSchedule] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false);

  // Loading/Trigger states
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Automatically clear toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Dynamic calculations from current backup state list
  const totalBackupsCount = backups.length;
  const successfulBackupsCount = backups.filter((b) => b.status === "success").length;
  const failedBackupsCount = backups.filter((b) => b.status === "failed").length;
  const estimatedTotalSizeKB = backups
    .filter((b) => b.status === "success")
    .reduce((sum, b) => sum + b.sizeKB, 0);

  // Format date helper: YYYY-MM-DD HH:MM:SS
  const formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // Format date helper for file naming: YYYY-MM-DD
  const formatDateOnly = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  // Generate dynamic CSV file content reflecting real application data states
  const generateDatabaseCSV = () => {
    let csv = "";
    csv += "# =========================================================\n";
    csv += "# TEA ESTATE MANAGEMENT SYSTEM DATA EXPORT - SYSTEM BACKUP\n";
    csv += `# Timestamp: ${formatDateTime(new Date())}\n`;
    csv += "# =========================================================\n\n";

    // Section 1: ESTATES
    csv += "[ESTATES]\n";
    csv += "ID,Name,Location,Area (Acres),Established Year,Planter,Supervisor,Status,Sections Count\n";
    estates.forEach((e) => {
      csv += `"${e.id}","${e.name.replace(/"/g, '""')}","${e.location.replace(/"/g, '""')}",${e.area},${e.establishedYear},"${e.planter.replace(/"/g, '""')}","${e.supervisor.replace(/"/g, '""')}","${e.status}",${e.sections?.length || 0}\n`;
    });
    csv += "\n";

    // Section 2: USERS
    csv += "[USERS]\n";
    csv += "ID,Name,Email,Phone,Role,Registered Date,Status\n";
    users.forEach((u) => {
      csv += `"${u.id}","${u.name.replace(/"/g, '""')}","${u.email.replace(/"/g, '""')}","${u.phone.replace(/"/g, '""')}","${u.role}","${u.registeredDate}","${u.status}"\n`;
    });
    csv += "\n";

    // Section 3: EMPLOYEES
    csv += "[EMPLOYEES]\n";
    csv += "ID,Name,Gender,Phone,NIC,Estate ID,Categories,Status\n";
    employees.forEach((emp) => {
      csv += `"${emp.id}","${emp.name.replace(/"/g, '""')}","${emp.gender}","${emp.phone.replace(/"/g, '""')}","${emp.nic}","${emp.estateId}","${emp.serviceCategories.join("; ")}","${emp.status}"\n`;
    });
    csv += "\n";

    // Section 4: SERVICES
    csv += "[SERVICES]\n";
    csv += "ID,Name,Description,Rate,Unit Type,Status\n";
    services.forEach((s) => {
      csv += `"${s.id}","${s.name.replace(/"/g, '""')}","${s.description.replace(/"/g, '""')}",${s.rate},"${s.unitType}","${s.status}"\n`;
    });
    csv += "\n";

    // Section 5: EXPENSES
    csv += "[EXPENSES]\n";
    csv += "ID,Date,Category,Description,Amount (LKR),Estate ID,Status\n";
    expenses.forEach((ex) => {
      csv += `"${ex.id}","${ex.date}","${ex.category}","${ex.description.replace(/"/g, '""')}",${ex.amount},"${ex.estateId}","${ex.status}"\n`;
    });
    csv += "\n";

    // Section 6: DAILY ASSIGNMENTS
    csv += "[DAILY ASSIGNMENTS]\n";
    csv += "ID,Date,Estate ID,Section ID,Service ID,Total Amount (LKR),Status,Assignments Count\n";
    assignments.forEach((da) => {
      csv += `"${da.id}","${da.date}","${da.estateId}","${da.sectionId}","${da.serviceId}",${da.totalAmount},"${da.status}",${da.assignments.length}\n`;
    });

    return csv;
  };

  // Create & Download Action
  const handleCreateBackup = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const newRecord = await createBackupMutation.mutateAsync("Manual");
      if (newRecord.status === "success") {
        await handleDownloadBackup(newRecord.id, newRecord.filename);
        setToastMessage("System backup successfully compiled and downloaded!");
      } else {
        setToastMessage("Backup compiled, but failed on server.");
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.response?.data?.message || err.message || "Backup generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBackup = async (id: string, filename: string) => {
    try {
      const response = await api.get(`/backups/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/zip" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(err);
      setToastMessage("Failed to download backup zip file.");
    }
  };

  // Re-download historical spreadsheet backup file
  const handleDownloadHistorical = (record: BackupRecord) => {
    if (record.status === "failed") return;
    void handleDownloadBackup(record.id, record.filename);
  };

  // Delete Backup
  const handleDeleteBackup = async (id: string, filename: string) => {
    if (confirm(`Are you sure you want to permanently delete the backup file "${filename}"?`)) {
      try {
        await deleteBackupMutation.mutateAsync(id);
        setToastMessage(`Deleted backup archive: ${filename}`);
      } catch (err: any) {
        console.error(err);
        setToastMessage("Failed to delete backup.");
      }
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden font-sans relative bg-[#F9FAFB]">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="absolute top-4 right-8 z-50 bg-[#00A63E] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg border border-emerald-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Dashboard Banner */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E5E7EB] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Backups</h1>
          <p className="text-sm font-normal text-[#6A7282] mt-0.5">
            Create, download and manage system data backups
          </p>
        </div>
      </header>

      {/* Workspace Area Scrollable */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 select-none">
        
        {/* Upper Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          
          {/* Card 1: Create Backup Card */}
          <div className="box-border flex flex-col justify-center items-center p-5 bg-white border border-[#F3F4F6] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[16px] flex-1 self-stretch h-[230px] gap-3">
            <div className="flex flex-row justify-center items-center w-12 h-12 bg-[#F0FDF4] rounded-[16px] shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <rect x="2" y="4" width="20" height="16" rx="4" stroke="#00A63E" strokeWidth="2" />
                <line x1="2" y1="12" x2="22" y2="12" stroke="#00A63E" strokeWidth="2" />
                <circle cx="6" cy="16" r="1" fill="#00A63E" />
                <circle cx="10" cy="16" r="1" fill="#00A63E" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-sans font-medium text-[14px] leading-5 text-center text-[#1E2939]">
                Create Backup
              </h2>
              <p className="font-sans font-normal text-[12px] leading-4 text-center text-[#99A1AF] pt-[2px]">
                Export all system data as Excel
              </p>
            </div>

            <button
              onClick={handleCreateBackup}
              disabled={isGenerating}
              className={`flex flex-row items-center justify-center p-[10px_20px] gap-2 w-[193px] h-10 bg-[#00A63E] hover:bg-[#008c35] text-white rounded-[14px] transition-all cursor-pointer select-none active:scale-[0.98] ${
                isGenerating ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="font-sans font-medium text-[14px] leading-5 text-center text-white">
                    Compiling...
                  </span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0">
                    <path d="M2 10V14H14V10" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 2V10" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.5 6.5L8 10L11.5 6.5" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-sans font-medium text-[14px] leading-5 text-center text-white">
                    Create & Download
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Storage Overview Card */}
          <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-[230px]">
            <div className="flex items-center gap-2 text-[#364153]">
              <HardDrive className="w-4.5 h-4.5 text-[#99A1AF]" />
              <h2 className="text-[14px] font-semibold">Storage Overview</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 flex-1">
              
              {/* Stat 1: Total Backups */}
              <div className="bg-[#EDE9FF] rounded-xl p-3 flex flex-col justify-between h-[66px]">
                <span className="text-[12px] font-normal text-[#1D65E2] leading-none">Total Backups</span>
                <span className="text-lg font-semibold text-[#1D65E2] leading-tight">{totalBackupsCount}</span>
              </div>

              {/* Stat 2: Successful */}
              <div className="bg-[#DCFCE7] rounded-xl p-3 flex flex-col justify-between h-[66px]">
                <span className="text-[12px] font-normal text-[#00A63E] leading-none">Successful</span>
                <span className="text-lg font-semibold text-[#00A63E] leading-tight">{successfulBackupsCount}</span>
              </div>

              {/* Stat 3: Failed */}
              <div className="bg-[#FFE2E2] rounded-xl p-3 flex flex-col justify-between h-[66px]">
                <span className="text-[12px] font-normal text-[#DE2413] leading-none">Failed</span>
                <span className="text-lg font-semibold text-[#DE2413] leading-tight">{failedBackupsCount}</span>
              </div>

              {/* Stat 4: Total Size */}
              <div className="bg-[#E6FCFF] rounded-xl p-3 flex flex-col justify-between h-[66px]">
                <span className="text-[12px] font-normal text-[#397ECD] leading-none">Est. Total Size</span>
                <span className="text-lg font-semibold text-[#397ECD] leading-tight">
                  {(estimatedTotalSizeKB).toFixed(1)} KB
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Section 2: Automatic Backup Scheduler Banner */}
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between min-h-[70px] relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FAF5FF] rounded-[14px] flex items-center justify-center shadow-xs">
              <Clock className="w-4.5 h-4.5 text-[#AD46FF]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#1E2939]">
                {isAutoBackupEnabled ? "Automatic Backup" : "Automated Backups Disabled"}
              </span>
              <span className="text-[12px] font-medium text-[#99A1AF] mt-0.5">
                {isAutoBackupEnabled ? `Scheduled — ${autoBackupSchedule}` : "Scheduled backups are turned off"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Switch */}
            <button
              onClick={() => setIsAutoBackupEnabled(!isAutoBackupEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none flex items-center ${
                isAutoBackupEnabled ? "bg-[#00C950]" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  isAutoBackupEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            {/* Scheduler Period Dropdown */}
            {isAutoBackupEnabled && (
              <div className="relative">
                <button
                  onClick={() => setIsScheduleDropdownOpen(!isScheduleDropdownOpen)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border border-[#D1D5DC]"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isScheduleDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isScheduleDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-30 w-36 bg-white border border-gray-100 rounded-xl shadow-xl p-1 animate-in fade-in-50 zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setAutoBackupSchedule("daily");
                        setIsScheduleDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#00A63E] rounded-lg cursor-pointer"
                    >
                      <span>Daily</span>
                      {autoBackupSchedule === "daily" && <Check className="w-3.5 h-3.5 text-[#00A63E]" />}
                    </button>
                    <button
                      onClick={() => {
                        setAutoBackupSchedule("weekly");
                        setIsScheduleDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#00A63E] rounded-lg cursor-pointer"
                    >
                      <span>Weekly</span>
                      {autoBackupSchedule === "weekly" && <Check className="w-3.5 h-3.5 text-[#00A63E]" />}
                    </button>
                    <button
                      onClick={() => {
                        setAutoBackupSchedule("monthly");
                        setIsScheduleDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#00A63E] rounded-lg cursor-pointer"
                    >
                      <span>Monthly</span>
                      {autoBackupSchedule === "monthly" && <Check className="w-3.5 h-3.5 text-[#00A63E]" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Backup History Table list */}
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[442px]">
          
          {/* Table Header Bar */}
          <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#99A1AF]" />
              <h3 className="text-[14px] font-semibold text-[#1E2939]">Backup History</h3>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">File Name</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">Created At</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">Type</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">Size</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">Records</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">Status</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6A7282] uppercase tracking-[0.3px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.length > 0 ? (
                  backups.map((rec) => (
                    <tr key={rec.id} className="border-b border-[#F9FAFB] hover:bg-gray-50/50 transition-colors">
                      {/* File Name */}
                      <td className="px-6 py-3.5 text-sm font-normal text-[#364153]">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[280px]">{rec.filename}</span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-3.5 text-sm font-normal text-[#6A7282] whitespace-nowrap">
                        {rec.createdAt}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-3.5 text-sm">
                        {rec.type === "Auto" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-normal bg-[#DBEAFE] text-[#155DFC] capitalize">
                            auto
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-normal bg-[#F3E8FF] text-[#9810FA] capitalize">
                            manual
                          </span>
                        )}
                      </td>

                      {/* Size */}
                      <td className="px-6 py-3.5 text-sm font-normal text-[#6A7282] whitespace-nowrap">
                        {rec.sizeKB} KB
                      </td>

                      {/* Records */}
                      <td className="px-6 py-3.5 text-sm font-normal text-[#6A7282]">
                        {rec.records !== null ? rec.records : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5 text-sm">
                        {rec.status === "success" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#008236] capitalize">
                            success
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FFE2E2] text-[#DE2413] capitalize">
                            failed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rec.status === "success" && (
                            <button
                              onClick={() => handleDownloadHistorical(rec)}
                              className="w-[26px] h-[26px] bg-[#F3F4F6] hover:bg-emerald-50 text-gray-400 hover:text-[#00A63E] rounded-lg border border-[#D1D5DC] flex items-center justify-center transition-colors cursor-pointer"
                              title="Download Backup"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBackup(rec.id, rec.filename)}
                            className="w-[26px] h-[26px] bg-[#F3F4F6] hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg border border-[#D1D5DC] flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Backup"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm font-medium">
                      No backups history records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Details */}
          <div className="px-6 py-3.5 border-t border-[#F3F4F6] bg-white flex items-center justify-between text-xs text-[#99A1AF]">
            <span>
              {totalBackupsCount} backup{totalBackupsCount !== 1 ? "s" : ""} - {successfulBackupsCount} successful
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
