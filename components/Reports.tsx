import { useState } from "react";
import { Estate } from "./EstateManagement";
import { Employee } from "./EmployeeManagement";
import { Service } from "./ServiceManagement";
import { DailyAssignment } from "./DailyAssignment";
import { Expense } from "./Expenses";

// --- Types ---
interface ReportsProps {
  estates: Estate[];
  employees: Employee[];
  services: Service[];
  assignments: DailyAssignment[];
  expenses: Expense[];
}

type ReportType = "payments" | "assignments" | "expenses" | "harvest";

interface AssignmentReportRow {
  date: string;
  estateName: string;
  sectionName: string;
  serviceName: string;
  workerName: string;
  employeeId: string;
  units: number;
  unitType: string;
  rate: number;
  payment: number;
}

interface PaymentReportRow {
  employeeId: string;
  workerName: string;
  estateName: string;
  totalUnits: number;
  unitType: string;
  grossPayment: number;
}

interface ExpenseReportRow {
  date: string;
  estateName: string;
  sectionOrCategory: string;
  description: string;
  amount: number;
  status: string;
}

interface HarvestReportRow {
  estateName: string;
  sectionName: string;
  totalHarvest: number;
  totalPayment: number;
  workerCount: number;
}

interface ActiveFilters {
  reportType: ReportType;
  fromDate: string;
  toDate: string;
  estateFilter: string;
  sectionFilter: string;
  workerFilter: string;
  serviceFilter: string;
}

export default function Reports({
  estates,
  employees,
  services,
  assignments,
  expenses,
}: ReportsProps) {
  // Input states updated directly by fields
  const [reportType, setReportType] = useState<ReportType>("assignments");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-06-30");
  const [estateFilter, setEstateFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // State governing the active report output (copied from selection states on "Generate")
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    reportType: "assignments",
    fromDate: "2026-05-01",
    toDate: "2026-06-30",
    estateFilter: "all",
    sectionFilter: "all",
    workerFilter: "all",
    serviceFilter: "all",
  });

  // Calculate dynamic section choices based on current dropdown selection state
  const availableSections =
    estateFilter === "all"
      ? estates.flatMap((e) => e.sections)
      : estates.find((e) => e.id === estateFilter)?.sections || [];

  const handleGenerateReport = () => {
    setActiveFilters({
      reportType,
      fromDate,
      toDate,
      estateFilter,
      sectionFilter,
      workerFilter,
      serviceFilter,
    });
  };

  const handleReportTypeTabChange = (type: ReportType) => {
    setReportType(type);
    setActiveFilters((prev) => ({
      ...prev,
      reportType: type,
    }));
  };

  // Derive reports data purely during render
  const getAssignmentsReport = (filters: ActiveFilters): AssignmentReportRow[] => {
    const list: AssignmentReportRow[] = [];
    assignments.forEach((da) => {
      if (da.date < filters.fromDate || da.date > filters.toDate) return;
      if (filters.estateFilter !== "all" && da.estateId !== filters.estateFilter) return;
      if (filters.sectionFilter !== "all" && da.sectionId !== filters.sectionFilter) return;
      if (filters.serviceFilter !== "all" && da.serviceId !== filters.serviceFilter) return;

      const estate = estates.find((e) => e.id === da.estateId);
      const section = estate?.sections.find((s) => s.id === da.sectionId);
      const service = services.find((s) => s.id === da.serviceId);

      da.assignments.forEach((wa) => {
        if (filters.workerFilter !== "all" && wa.employeeId !== filters.workerFilter) return;

        const worker = employees.find((e) => e.id === wa.employeeId);
        list.push({
          date: da.date,
          estateName: estate?.name || "Unknown Estate",
          sectionName: section?.name || "Unknown Section",
          serviceName: service?.name || "Unknown Service",
          workerName: worker?.name || "Unknown Worker",
          employeeId: wa.employeeId,
          units: wa.unitsCompleted,
          unitType: service?.unitType || "KG",
          rate: service?.rate || 0,
          payment: wa.paymentAmount,
        });
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  };

  const getPaymentsReport = (filters: ActiveFilters): PaymentReportRow[] => {
    const grouped: Record<string, PaymentReportRow> = {};
    assignments.forEach((da) => {
      if (da.date < filters.fromDate || da.date > filters.toDate) return;
      if (filters.estateFilter !== "all" && da.estateId !== filters.estateFilter) return;
      if (filters.sectionFilter !== "all" && da.sectionId !== filters.sectionFilter) return;
      if (filters.serviceFilter !== "all" && da.serviceId !== filters.serviceFilter) return;

      const estate = estates.find((e) => e.id === da.estateId);
      const service = services.find((s) => s.id === da.serviceId);

      da.assignments.forEach((wa) => {
        if (filters.workerFilter !== "all" && wa.employeeId !== filters.workerFilter) return;

        const worker = employees.find((e) => e.id === wa.employeeId);
        const key = wa.employeeId;

        if (!grouped[key]) {
          grouped[key] = {
            employeeId: wa.employeeId,
            workerName: worker?.name || "Unknown Worker",
            estateName: estate?.name || "Multiple Estates",
            totalUnits: 0,
            unitType: service?.unitType || "Units",
            grossPayment: 0,
          };
        } else {
          if (grouped[key].estateName !== estate?.name) {
            grouped[key].estateName = "Multiple Estates";
          }
          if (grouped[key].unitType !== service?.unitType) {
            grouped[key].unitType = "Mixed";
          }
        }

        grouped[key].totalUnits += wa.unitsCompleted;
        grouped[key].grossPayment += wa.paymentAmount;
      });
    });

    const list = Object.values(grouped);
    return list.sort((a, b) => b.grossPayment - a.grossPayment);
  };

  const getExpensesReport = (filters: ActiveFilters): ExpenseReportRow[] => {
    const list: ExpenseReportRow[] = [];
    expenses.forEach((ex) => {
      if (ex.date < filters.fromDate || ex.date > filters.toDate) return;
      if (filters.estateFilter !== "all" && ex.estateId !== filters.estateFilter) return;
      if (filters.sectionFilter !== "all" && ex.sectionId !== filters.sectionFilter) return;

      const estate = estates.find((e) => e.id === ex.estateId);
      const section = estate?.sections.find((s) => s.id === ex.sectionId);

      list.push({
        date: ex.date,
        estateName: estate?.name || "Global / General",
        sectionOrCategory: section?.name ? `${section.name} / ${ex.category}` : ex.category,
        description: ex.description,
        amount: ex.amount,
        status: ex.status,
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  };

  const getHarvestReport = (filters: ActiveFilters): HarvestReportRow[] => {
    const keyMap: Record<
      string,
      {
        estateName: string;
        sectionName: string;
        totalHarvest: number;
        totalPayment: number;
        workers: Set<string>;
      }
    > = {};

    assignments.forEach((da) => {
      if (da.date < filters.fromDate || da.date > filters.toDate) return;
      if (filters.estateFilter !== "all" && da.estateId !== filters.estateFilter) return;
      if (filters.sectionFilter !== "all" && da.sectionId !== filters.sectionFilter) return;
      if (filters.serviceFilter !== "all" && da.serviceId !== filters.serviceFilter) return;

      const service = services.find((s) => s.id === da.serviceId);
      if (service?.unitType !== "KG" && service?.name.toLowerCase() !== "leaf plucking") return;

      const estate = estates.find((e) => e.id === da.estateId);
      const section = estate?.sections.find((s) => s.id === da.sectionId);

      const key = `${da.estateId}_${da.sectionId}`;

      if (!keyMap[key]) {
        keyMap[key] = {
          estateName: estate?.name || "Unknown Estate",
          sectionName: section?.name || "Unknown Section",
          totalHarvest: 0,
          totalPayment: 0,
          workers: new Set<string>(),
        };
      }

      da.assignments.forEach((wa) => {
        if (filters.workerFilter !== "all" && wa.employeeId !== filters.workerFilter) return;
        keyMap[key].totalHarvest += wa.unitsCompleted;
        keyMap[key].totalPayment += wa.paymentAmount;
        keyMap[key].workers.add(wa.employeeId);
      });
    });

    const list = Object.values(keyMap)
      .filter((item) => item.totalHarvest > 0)
      .map((item) => ({
        estateName: item.estateName,
        sectionName: item.sectionName,
        totalHarvest: item.totalHarvest,
        totalPayment: item.totalPayment,
        workerCount: item.workers.size,
      }));

    return list.sort((a, b) => b.totalHarvest - a.totalHarvest);
  };

  // Switch dynamically computed results list
  const getActiveData = () => {
    switch (activeFilters.reportType) {
      case "assignments":
        return getAssignmentsReport(activeFilters);
      case "payments":
        return getPaymentsReport(activeFilters);
      case "expenses":
        return getExpensesReport(activeFilters);
      case "harvest":
        return getHarvestReport(activeFilters);
      default:
        return [];
    }
  };

  const reportData = getActiveData();
  const totalCount = reportData.length;

  // Handle excel export (CSV client-side download)
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `report_${activeFilters.reportType}_${activeFilters.fromDate}_to_${activeFilters.toDate}.csv`;

    if (activeFilters.reportType === "assignments") {
      const data = reportData as AssignmentReportRow[];
      headers = [
        "Date",
        "Estate",
        "Section",
        "Service",
        "Worker",
        "Employee ID",
        "Units Completed",
        "Unit Type",
        "Rate (LKR)",
        "Payment (LKR)",
      ];
      rows = data.map((d) => [
        d.date,
        d.estateName,
        d.sectionName,
        d.serviceName,
        d.workerName,
        d.employeeId,
        d.units.toString(),
        d.unitType,
        d.rate.toString(),
        d.payment.toString(),
      ]);
    } else if (activeFilters.reportType === "payments") {
      const data = reportData as PaymentReportRow[];
      headers = [
        "Employee ID",
        "Worker Name",
        "Estate",
        "Total Units",
        "Unit Type",
        "Gross Payment (LKR)",
      ];
      rows = data.map((d) => [
        d.employeeId,
        d.workerName,
        d.estateName,
        d.totalUnits.toString(),
        d.unitType,
        d.grossPayment.toString(),
      ]);
    } else if (activeFilters.reportType === "expenses") {
      const data = reportData as ExpenseReportRow[];
      headers = ["Date", "Estate", "Category/Section", "Description", "Amount (LKR)", "Status"];
      rows = data.map((d) => [
        d.date,
        d.estateName,
        d.sectionOrCategory,
        d.description,
        d.amount.toString(),
        d.status,
      ]);
    } else if (activeFilters.reportType === "harvest") {
      const data = reportData as HarvestReportRow[];
      headers = [
        "Estate",
        "Section",
        "Total Harvest (KG)",
        "Total Payment (LKR)",
        "Workers Participated",
      ];
      rows = data.map((d) => [
        d.estateName,
        d.sectionName,
        d.totalHarvest.toString(),
        d.totalPayment.toString(),
        d.workerCount.toString(),
      ]);
    }

    // Generate CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(",")].concat(rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle PDF print export
  const handleExportPDF = () => {
    window.print();
  };

  // Helper formatting values
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace("LKR", "Rs.");
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F9FAFB]">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide Sidebar, Filters panel, Generate button, and Actions bar */
          aside, nav, form, button, .no-print {
            display: none !important;
          }
          /* Stretch the report content area */
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          /* Ensure text is clearly visible */
          th, td {
            color: black !important;
            border-bottom: 1px solid #ddd !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 select-none print-full-width">
        {/* Page Header */}
        <div className="shrink-0 no-print">
          <h1 className="text-[24px] font-medium text-[#101828] leading-[36px] font-sans">
            Reports
          </h1>
          <p className="text-[14px] font-normal text-[#6A7282] leading-[20px] mt-0.5 font-sans">
            Generate and export detailed estate reports
          </p>
        </div>

        {/* Layout Grid */}
        <div className="flex-1 flex gap-5 min-h-[500px]">
          {/* Left Panel: Report Filters Card */}
          <div className="w-[298px] bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm p-5 flex flex-col gap-5 shrink-0 h-fit no-print">
            {/* Header */}
            <div className="flex items-center gap-2 pb-0.5">
              <svg className="w-4.5 h-4.5 text-[#1E2939]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-[#1E2939] leading-tight font-sans">
                Report Filters
              </h3>
            </div>

            {/* Filter Fields Form */}
            <div className="flex flex-col gap-4">
              {/* Report Type selector buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#6A7282] uppercase tracking-[0.3px] font-sans">
                  Report Type
                </span>

                <button
                  type="button"
                  onClick={() => handleReportTypeTabChange("payments")}
                  className={`flex items-center gap-2.5 px-3 py-2 border rounded-[14px] text-xs font-semibold text-left transition-all cursor-pointer ${reportType === "payments"
                    ? "bg-[#F0FDF4] border-[#00C950] text-[#008236] shadow-xs"
                    : "bg-white border-[#F3F4F6] hover:bg-gray-50 text-[#364153]"
                    }`}
                >
                  {/* <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" />
                  </svg> */}
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <g fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22Z" />
                      <path strokeLinecap="round" d="M12 15.333c1.105 0 2-.746 2-1.666S13.105 12 12 12s-2-.746-2-1.667c0-.92.895-1.666 2-1.666m0 6.666c-1.105 0-2-.746-2-1.666m2 1.666V16m0-8v.667m0 0c1.105 0 2 .746 2 1.666" />
                    </g>
                  </svg>

                  <span>Worker Payments</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReportTypeTabChange("assignments")}
                  className={`flex items-center gap-2.5 px-3 py-2 border rounded-[14px] text-xs font-semibold text-left transition-all cursor-pointer ${reportType === "assignments"
                    ? "bg-[#F0FDF4] border-[#00C950] text-[#008236] shadow-xs"
                    : "bg-white border-[#F3F4F6] hover:bg-gray-50 text-[#364153]"
                    }`}
                >
                  {/* <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg> */}
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" d="M7 14h10M7 11h10M7 17h6m3-14v2.2a.8.8 0 0 1-.8.8H8.8a.8.8 0 0 1-.8-.8V3m2 0a2 2 0 1 1 4 0M5.4 3h13.2A2.4 2.4 0 0 1 21 5.4v15.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 20.6V5.4A2.4 2.4 0 0 1 5.4 3" />
                  </svg>

                  <span>Daily Assignments</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReportTypeTabChange("expenses")}
                  className={`flex items-center gap-2.5 px-3 py-2 border rounded-[14px] text-xs font-semibold text-left transition-all cursor-pointer ${reportType === "expenses"
                    ? "bg-[#F0FDF4] border-[#00C950] text-[#008236] shadow-xs"
                    : "bg-white border-[#F3F4F6] hover:bg-gray-50 text-[#364153]"
                    }`}
                >
                  {/* <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg> */}
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                      <path d="m10.05 10.607l-7.07 7.07a2 2 0 0 0 0 2.83v0a2 2 0 0 0 2.828 0l7.07-7.072m4.315.365l3.878 3.878a2 2 0 0 1 0 2.828v0a2 2 0 0 1-2.828 0l-6.209-6.208M6.733 5.904L4.61 6.61L2.49 3.075l1.414-1.414L7.44 3.782zm0 0l2.83 2.83" />
                      <path d="M10.05 10.607c-.844-2.153-.679-4.978 1.061-6.718s4.95-2.121 6.717-1.06l-3.04 3.04l-.283 3.111l3.111-.282l3.04-3.041c1.062 1.768.68 4.978-1.06 6.717c-1.74 1.74-4.564 1.905-6.717 1.061" />
                    </g>
                  </svg>

                  <span>Expense Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReportTypeTabChange("harvest")}
                  className={`flex items-center gap-2.5 px-3 py-2 border rounded-[14px] text-xs font-semibold text-left transition-all cursor-pointer ${reportType === "harvest"
                    ? "bg-[#F0FDF4] border-[#00C950] text-[#008236] shadow-xs"
                    : "bg-white border-[#F3F4F6] hover:bg-gray-50 text-[#364153]"
                    }`}
                >
                  {/* <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg> */}
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                    <path d="M0 0h512v512H0z" fill="none" />
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M321.89 171.42C233 114 141 155.22 56 65.22c-19.8-21-8.3 235.5 98.1 332.7c77.79 71 197.9 63.08 238.4-5.92s18.28-163.17-70.61-220.58" />
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M173 253c86 81 175 129 292 147" />
                  </svg>

                  <span>Harvest Summary</span>
                </button>
              </div>

              {/* From Date */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#6A7282] mb-1.5 font-sans">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm text-[#0A0A0A] bg-white outline-none font-sans"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#6A7282] mb-1.5 font-sans">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm text-[#0A0A0A] bg-white outline-none font-sans"
                />
              </div>

              {/* Estate dropdown */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#6A7282] mb-1.5 font-sans">
                  Estate
                </label>
                <select
                  value={estateFilter}
                  onChange={(e) => {
                    setEstateFilter(e.target.value);
                    setSectionFilter("all"); // Reset section filter when estate changes
                  }}
                  className="w-full h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-2 text-sm text-[#0A0A0A] bg-white outline-none font-sans cursor-pointer"
                >
                  <option value="all">All Estates</option>
                  {estates.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section dropdown */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#6A7282] mb-1.5 font-sans">
                  Section
                </label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-2 text-sm text-[#0A0A0A] bg-white outline-none font-sans cursor-pointer"
                >
                  <option value="all">All Sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Worker dropdown (Disabled for Harvest Summary and Expense Report) */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#6A7282] mb-1.5 font-sans">
                  Worker
                </label>
                <select
                  value={workerFilter}
                  onChange={(e) => setWorkerFilter(e.target.value)}
                  disabled={reportType === "expenses" || reportType === "harvest"}
                  className="w-full h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-2 text-sm text-[#0A0A0A] bg-white outline-none font-sans cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="all">All Workers</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service dropdown (Only applicable to assignments / payments / harvest) */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#6A7282] mb-1.5 font-sans">
                  Service
                </label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  disabled={reportType === "expenses"}
                  className="w-full h-10 border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-2 text-sm text-[#0A0A0A] bg-white outline-none font-sans cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="all">All Services</option>
                  {services.map((ser) => (
                    <option key={ser.id} value={ser.id}>
                      {ser.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Report button */}
              <button
                type="button"
                onClick={handleGenerateReport}
                className="w-full h-11 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-semibold rounded-[14px] mt-2 transition-colors cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
              >
                Generate Report
              </button>
            </div>
          </div>

          {/* Right Panel: Report Results Card */}
          <div className="flex-1 bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm flex flex-col overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] shrink-0">
              <div className="flex flex-col">
                <h3 className="text-[18px] font-semibold text-[#1E2939] leading-tight font-sans">
                  {activeFilters.reportType === "assignments"
                    ? "Daily Assignments"
                    : activeFilters.reportType === "payments"
                      ? "Worker Payments"
                      : activeFilters.reportType === "expenses"
                        ? "Expense Report"
                        : "Harvest Summary"}
                </h3>
                <p className="text-[12px] font-normal text-[#99A1AF] mt-1 font-sans">
                  {activeFilters.fromDate} to {activeFilters.toDate} • {totalCount} records
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 no-print shrink-0">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F0FDF4] border border-[#B9F8CF] hover:opacity-90 rounded-[14px] text-xs font-semibold text-[#008236] transition-all cursor-pointer h-9 shadow-2xs"
                  title="Export report to Excel CSV"
                >
                  <svg className="w-4 h-4 text-[#008236]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#FEF2F2] border border-[#FFC9C9] hover:opacity-90 rounded-[14px] text-xs font-semibold text-[#C10007] transition-all cursor-pointer h-9 shadow-2xs"
                  title="Print Report as PDF"
                >
                  <svg className="w-4 h-4 text-[#C10007]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Total Records Info Bar */}
            <div className="bg-[#F9FAFB] border-b border-[#F3F4F6] px-5 py-2.5 shrink-0 flex items-center justify-between text-xs font-medium text-[#4A5565] font-sans">
              <span>Total Records: {totalCount}</span>
            </div>

            {/* Results Table container */}
            <div className="flex-1 overflow-auto">
              {reportData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-10 text-center select-none font-sans">
                  <svg className="w-12 h-12 text-gray-300 stroke-1.5 mb-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.25A2.25 2.25 0 0118 21H6a2.25 2.25 0 01-2.25-2.25v-4.25A2.25 2.25 0 012.25 13.5zM12 3v9m0 0l-3-3m3 3l3-3" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-500">No records found matching filters</span>
                  <span className="text-xs text-gray-400 mt-1">Adjust dates or fields above and click Generate Report</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-sans min-w-[800px]">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-[10px] font-bold text-[#6A7282] uppercase tracking-[0.3px]">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      {activeFilters.reportType === "assignments" && (
                        <>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Estate</th>
                          <th className="py-3 px-3">Section</th>
                          <th className="py-3 px-3">Service</th>
                          <th className="py-3 px-3">Worker</th>
                          <th className="py-3 px-3">Employee ID</th>
                          <th className="py-3 px-3 text-right">Units</th>
                          <th className="py-3 px-3">Unit Type</th>
                          <th className="py-3 px-3 text-right">Rate</th>
                          <th className="py-3 px-4 text-right">Payment</th>
                        </>
                      )}
                      {activeFilters.reportType === "payments" && (
                        <>
                          <th className="py-3 px-3">Employee ID</th>
                          <th className="py-3 px-3">Worker Name</th>
                          <th className="py-3 px-3">Home Estate</th>
                          <th className="py-3 px-3 text-right">Total Units</th>
                          <th className="py-3 px-3">Unit Type</th>
                          <th className="py-3 px-4 text-right">Gross Payment</th>
                        </>
                      )}
                      {activeFilters.reportType === "expenses" && (
                        <>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Estate</th>
                          <th className="py-3 px-3">Section / Category</th>
                          <th className="py-3 px-3">Description</th>
                          <th className="py-3 px-3 text-right">Amount</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </>
                      )}
                      {activeFilters.reportType === "harvest" && (
                        <>
                          <th className="py-3 px-3">Estate Name</th>
                          <th className="py-3 px-3">Section Name</th>
                          <th className="py-3 px-3 text-right">Total Harvest</th>
                          <th className="py-3 px-3 text-right">Total Payment</th>
                          <th className="py-3 px-4 text-center">Workers Participated</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F9FAFB] text-xs">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center text-[#99A1AF] font-mono">{idx + 1}</td>

                        {activeFilters.reportType === "assignments" && (
                          <>
                            <td className="py-3.5 px-3 text-[#364153] font-mono whitespace-nowrap">{(row as AssignmentReportRow).date}</td>
                            <td className="py-3.5 px-3 text-[#364153] font-medium">{(row as AssignmentReportRow).estateName}</td>
                            <td className="py-3.5 px-3 text-[#6A7282]">{(row as AssignmentReportRow).sectionName}</td>
                            <td className="py-3.5 px-3 text-[#364153]">{(row as AssignmentReportRow).serviceName}</td>
                            <td className="py-3.5 px-3 text-[#364153] font-medium">{(row as AssignmentReportRow).workerName}</td>
                            <td className="py-3.5 px-3 text-[#6A7282] font-mono">{(row as AssignmentReportRow).employeeId}</td>
                            <td className="py-3.5 px-3 text-[#364153] text-right font-mono font-medium">{(row as AssignmentReportRow).units}</td>
                            <td className="py-3.5 px-3 text-[#6A7282]">{(row as AssignmentReportRow).unitType}</td>
                            <td className="py-3.5 px-3 text-[#6A7282] text-right font-mono">{formatCurrency((row as AssignmentReportRow).rate)}</td>
                            <td className="py-3.5 px-4 text-[#008236] text-right font-mono font-semibold">{formatCurrency((row as AssignmentReportRow).payment)}</td>
                          </>
                        )}

                        {activeFilters.reportType === "payments" && (
                          <>
                            <td className="py-3.5 px-3 text-[#6A7282] font-mono font-medium">{(row as PaymentReportRow).employeeId}</td>
                            <td className="py-3.5 px-3 text-[#364153] font-semibold">{(row as PaymentReportRow).workerName}</td>
                            <td className="py-3.5 px-3 text-[#364153]">{(row as PaymentReportRow).estateName}</td>
                            <td className="py-3.5 px-3 text-[#364153] text-right font-mono font-semibold">{(row as PaymentReportRow).totalUnits}</td>
                            <td className="py-3.5 px-3 text-[#6A7282]">{(row as PaymentReportRow).unitType}</td>
                            <td className="py-3.5 px-4 text-[#00A63E] text-right font-mono font-bold text-sm">{formatCurrency((row as PaymentReportRow).grossPayment)}</td>
                          </>
                        )}

                        {activeFilters.reportType === "expenses" && (
                          <>
                            <td className="py-3.5 px-3 text-[#364153] font-mono whitespace-nowrap">{(row as ExpenseReportRow).date}</td>
                            <td className="py-3.5 px-3 text-[#364153] font-medium">{(row as ExpenseReportRow).estateName}</td>
                            <td className="py-3.5 px-3 text-[#6A7282]">{(row as ExpenseReportRow).sectionOrCategory}</td>
                            <td className="py-3.5 px-3 text-[#364153] max-w-[200px] truncate" title={(row as ExpenseReportRow).description}>
                              {(row as ExpenseReportRow).description}
                            </td>
                            <td className="py-3.5 px-3 text-[#CA3500] text-right font-mono font-semibold">{formatCurrency((row as ExpenseReportRow).amount)}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(row as ExpenseReportRow).status === "approved"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : (row as ExpenseReportRow).status === "rejected"
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : "bg-amber-50 border-amber-200 text-amber-700"
                                  }`}
                              >
                                {(row as ExpenseReportRow).status}
                              </span>
                            </td>
                          </>
                        )}

                        {activeFilters.reportType === "harvest" && (
                          <>
                            <td className="py-3.5 px-3 text-[#364153] font-semibold">{(row as HarvestReportRow).estateName}</td>
                            <td className="py-3.5 px-3 text-[#364153]">{(row as HarvestReportRow).sectionName}</td>
                            <td className="py-3.5 px-3 text-[#008236] text-right font-mono font-bold">{(row as HarvestReportRow).totalHarvest} KG</td>
                            <td className="py-3.5 px-3 text-[#364153] text-right font-mono font-semibold">{formatCurrency((row as HarvestReportRow).totalPayment)}</td>
                            <td className="py-3.5 px-4 text-center font-mono text-[#6A7282]">{(row as HarvestReportRow).workerCount}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
