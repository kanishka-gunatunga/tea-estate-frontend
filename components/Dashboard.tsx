"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Plus, 
  Eye, 
  ArrowRight, 
  ChevronDown, 
  Users, 
  Leaf, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  CalendarDays 
} from "lucide-react";
import { useEstatesQuery, useAssignmentsQuery, useExpensesQuery, useEventsQuery, useEmployeesQuery } from "@/hooks/hooks";

export default function Dashboard() {
  const { data: serverEstates } = useEstatesQuery();
  const { data: serverAssignments } = useAssignmentsQuery();
  const { data: serverExpenses } = useExpensesQuery();
  const { data: serverEvents } = useEventsQuery();
  const { data: serverEmployees } = useEmployeesQuery();

  const estates = (serverEstates as any[]) || [];
  const assignments = (serverAssignments as any[]) || [];
  const expenses = (serverExpenses as any[]) || [];
  const events = (serverEvents as any[]) || [];
  const employees = (serverEmployees as any[]) || [];

  // Filter states
  const [selectedEstateId, setSelectedEstateId] = useState<string>("estate-1"); // Defaults to Greenleaf Tea Estate
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year" | "custom">("month");
  
  // Date Picker states - default to June 1 to June 8 as shown in Figma
  const [startDate, setStartDate] = useState<string>("2026-06-01");
  const [endDate, setEndDate] = useState<string>("2026-06-08");

  // Get current active estate object
  const activeEstate = useMemo(() => {
    return estates.find((e) => e.id === selectedEstateId) || estates[0];
  }, [estates, selectedEstateId]);

  // Handle preset range buttons
  const handleRangeChange = (range: "today" | "week" | "month" | "year") => {
    setTimeRange(range);
    // Seed data is centered around June 2026 (primarily June 15 for assignments)
    // We mock the system date as June 15, 2026 for a live feel
    const systemToday = "2026-06-15";
    
    if (range === "today") {
      setStartDate("2026-06-15");
      setEndDate("2026-06-15");
    } else if (range === "week") {
      setStartDate("2026-06-09");
      setEndDate("2026-06-15");
    } else if (range === "month") {
      setStartDate("2026-06-01");
      setEndDate("2026-06-30");
    } else if (range === "year") {
      setStartDate("2026-01-01");
      setEndDate("2026-12-31");
    }
  };

  // Helper to filter items based on selected estate and date range
  const filterByEstateAndDate = <T extends { estateId?: string; date: string }>(items: T[]): T[] => {
    return items.filter((item) => {
      // 1. Estate filter (if not 'all')
      if (selectedEstateId !== "all" && item.estateId !== selectedEstateId) {
        return false;
      }
      // 2. Date filter
      return item.date >= startDate && item.date <= endDate;
    });
  };

  // Filtered records for KPIs and sub-elements
  const filteredAssignments = useMemo(() => filterByEstateAndDate(assignments), [assignments, selectedEstateId, startDate, endDate]);
  const filteredExpenses = useMemo(() => filterByEstateAndDate(expenses), [expenses, selectedEstateId, startDate, endDate]);

  // KPI 1: Active Workers
  const activeWorkersCount = useMemo(() => {
    // Count active status employees assigned to the active estate
    const estateEmployees = employees.filter((emp) => 
      selectedEstateId === "all" || emp.estateId === selectedEstateId
    );
    const active = estateEmployees.filter((emp) => emp.status === "active").length;
    const total = estateEmployees.length;
    return { active, total };
  }, [employees, selectedEstateId]);

  // KPI 2: Plucked KG
  const totalPluckedKg = useMemo(() => {
    // Sum unitsCompleted in assignments where service is Leaf Plucking (service-6) and approved
    return filteredAssignments
      .filter((da) => da.serviceId === "service-6" && da.status === "approved")
      .reduce((sum, da) => {
        const daSum = da.assignments.reduce((s: number, a: any) => s + a.unitsCompleted, 0);
        return sum + daSum;
      }, 0);
  }, [filteredAssignments]);

  // KPI 3: Payroll LKR
  const totalPayroll = useMemo(() => {
    // Sum totalAmount of approved assignments in the range
    return filteredAssignments
      .filter((da) => da.status === "approved")
      .reduce((sum, da) => sum + da.totalAmount, 0);
  }, [filteredAssignments]);

  // KPI 4: Expenses LKR
  const totalExpenses = useMemo(() => {
    // Sum amount of approved/pending expenses in the range (excluding rejected)
    return filteredExpenses
      .filter((ex) => ex.status !== "rejected")
      .reduce((sum, ex) => sum + ex.amount, 0);
  }, [filteredExpenses]);

  // Donut Chart Calculation: Expenses Breakdown
  const expenseBreakdown = useMemo(() => {
    const categories = ["Utilities", "Transport", "Tools", "Other"];
    const aggregates = categories.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<string, number>);

    let grandTotal = 0;

    filteredExpenses
      .filter((ex) => ex.status !== "rejected")
      .forEach((ex) => {
        const cat = categories.includes(ex.category) ? ex.category : "Other";
        aggregates[cat] += ex.amount;
        grandTotal += ex.amount;
      });

    return { aggregates, grandTotal };
  }, [filteredExpenses]);

  // SVG Donut Path rendering values
  const donutSegments = useMemo(() => {
    const { aggregates, grandTotal } = expenseBreakdown;
    const categories = ["Utilities", "Transport", "Tools", "Other"];
    const colors = {
      Utilities: "#00BC7D", // Green
      Transport: "#FF6900", // Orange
      Tools: "#CA3500",     // Red-orange
      Other: "#364153",     // Dark slate gray
    };

    if (grandTotal === 0) {
      return [{ category: "No Data", value: 0, percent: 100, strokeDasharray: "251.2", strokeDashoffset: "0", color: "#E5E7EB" }];
    }

    let cumulativePercent = 0;
    return categories.map((cat) => {
      const val = aggregates[cat] || 0;
      const percent = (val / grandTotal) * 100;
      const circumference = 2 * Math.PI * 40; // radius = 40 => circumference ≈ 251.2
      const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercent / 100) * circumference);
      cumulativePercent += percent;

      return {
        category: cat,
        value: val,
        percent,
        strokeDasharray,
        strokeDashoffset: strokeDashoffset.toString(),
        color: colors[cat as keyof typeof colors],
      };
    });
  }, [expenseBreakdown]);

  // Bar Chart Data Calculation: Payroll vs Expenses trend
  // Filters data in 2026, groupings by month Jan-Jun
  const monthlyTrendsData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const estateAssignments = assignments.filter((da) => selectedEstateId === "all" || da.estateId === selectedEstateId);
    const estateExpenses = expenses.filter((ex) => selectedEstateId === "all" || ex.estateId === selectedEstateId);

    return months.map((month, index) => {
      // Month indices are 01 to 06
      const monthPrefix = `2026-0${index + 1}`;
      
      const payrollSum = estateAssignments
        .filter((da) => da.date.startsWith(monthPrefix) && da.status === "approved")
        .reduce((sum, da) => sum + da.totalAmount, 0);

      const expensesSum = estateExpenses
        .filter((ex) => ex.date.startsWith(monthPrefix) && ex.status === "approved")
        .reduce((sum, ex) => sum + ex.amount, 0);

      return {
        month,
        payroll: payrollSum,
        expenses: expensesSum,
      };
    });
  }, [assignments, expenses, selectedEstateId]);

  // Maximum value for chart scaling
  const barChartMaxVal = useMemo(() => {
    const vals = monthlyTrendsData.flatMap((d) => [d.payroll, d.expenses]);
    const max = Math.max(...vals, 260000); // Scale up to at least 260k as in Figma
    return Math.ceil(max / 50000) * 50000; // Round up to nearest 50k
  }, [monthlyTrendsData]);

  // Y-axis grid values
  const barChartGridLines = useMemo(() => {
    const step = barChartMaxVal / 4;
    return Array.from({ length: 5 }, (_, i) => Math.round(step * i));
  }, [barChartMaxVal]);

  // Upcoming Calendar Events (Next 3 events matching filters or closest future ones)
  const upcomingEvents = useMemo(() => {
    // Filter by estate and sort by date ascending
    const filteredEvents = events.filter((ev) => 
      selectedEstateId === "all" || !ev.estateId || ev.estateId === selectedEstateId
    );
    return [...filteredEvents]
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 3);
  }, [events, selectedEstateId]);

  // Harvest by Section summary
  const harvestBySection = useMemo(() => {
    if (!activeEstate || !activeEstate.sections) return [];
    
    return activeEstate.sections.map((section: any) => {
      // Sum unitsCompleted for this section's leaf pluck assignments in filtered range
      const pluckSum = filteredAssignments
        .filter((da) => da.sectionId === section.id && da.serviceId === "service-6" && da.status === "approved")
        .reduce((sum, da) => {
          const daSum = da.assignments.reduce((s: number, a: any) => s + a.unitsCompleted, 0);
          return sum + daSum;
        }, 0);

      return {
        id: section.id,
        name: section.name,
        amount: pluckSum,
      };
    });
  }, [activeEstate, filteredAssignments]);

  // Apply button handler for custom date picking
  const handleApplyCustomDates = () => {
    setTimeRange("custom");
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F9FAFB]">
      {/* Scrollable Main Content Container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-[#101828] leading-[36px] font-sans">
              Dashboard
            </h1>
            
            {/* Estate Overview Filter Dropdown */}
            <div className="relative mt-1">
              <select
                value={selectedEstateId}
                onChange={(e) => setSelectedEstateId(e.target.value)}
                className="appearance-none h-[30px] bg-[#F0FDF4] border border-[#00C950] rounded-[14px] pl-3 pr-8 py-1 text-xs font-medium text-[#6A7282] focus:outline-none cursor-pointer font-sans"
              >
                <option value="all">All Estates Overview</option>
                {estates.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name} Overview
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6A7282] w-3.5 h-3.5">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Date and Range Filter controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Preset Range Selector Buttons */}
            <div className="flex bg-[#F3F4F6] p-1 rounded-[14px] shrink-0 select-none">
              {(["today", "week", "month", "year"] as const).map((r) => {
                const isActive = timeRange === r;
                const labels = { today: "Today", week: "This Week", month: "This Month", year: "This Year" };
                return (
                  <button
                    key={r}
                    onClick={() => handleRangeChange(r)}
                    className={`h-[28px] px-3.5 text-xs font-semibold rounded-[10px] transition-all cursor-pointer font-sans ${
                      isActive
                        ? "bg-[#00A63E] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                        : "text-[#6A7282] hover:text-[#364153]"
                    }`}
                  >
                    {labels[r]}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Pickers */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1 border border-[#E5E7EB] rounded-[14px] shrink-0 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setTimeRange("custom");
                  }}
                  className="bg-transparent text-xs text-gray-700 font-sans outline-none cursor-pointer"
                />
              </div>
              <span className="text-xs text-[#99A1AF] font-sans font-medium px-0.5">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setTimeRange("custom");
                }}
                className="bg-transparent text-xs text-gray-700 font-sans outline-none cursor-pointer"
              />
              
              <button
                onClick={handleApplyCustomDates}
                className="h-[24px] px-3 bg-[#00A63E] hover:bg-[#009966] text-white text-[11px] font-semibold rounded-[10px] transition-all active:scale-[0.98] cursor-pointer font-sans shrink-0 ml-1.5"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Grid Section (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          
          {/* Card: New Daily Assignment */}
          <Link
            href="/dashboard/assignments"
            className="flex items-center gap-5 p-4 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-[40px] h-[40px] bg-[#FAF5FF] rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-5 h-5 text-[#9810FA] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#1E2939] leading-[20px] font-sans">
                New Daily Assignment
              </span>
              <span className="text-xs font-medium text-[#99A1AF] leading-[16px] font-sans mt-0.5">
                Record today's work
              </span>
            </div>
          </Link>

          {/* Card: Add Expense */}
          <Link
            href="/dashboard/expenses"
            className="flex items-center gap-5 p-4 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-[40px] h-[40px] bg-[#FFF2DA] rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-5 h-5 text-[#FF6900] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#1E2939] leading-[20px] font-sans">
                Add Expense
              </span>
              <span className="text-xs font-medium text-[#99A1AF] leading-[16px] font-sans mt-0.5">
                Log a new expense
              </span>
            </div>
          </Link>

          {/* Card: Add Worker */}
          <Link
            href="/dashboard/employees"
            className="flex items-center gap-5 p-4 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-[40px] h-[40px] bg-[#F0F0FF] rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-5 h-5 text-[#155DFC] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#1E2939] leading-[20px] font-sans">
                Add Worker
              </span>
              <span className="text-xs font-medium text-[#99A1AF] leading-[16px] font-sans mt-0.5">
                Register new employee
              </span>
            </div>
          </Link>

          {/* Card: View Reports */}
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-5 p-4 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-[40px] h-[40px] bg-[#E8FFE8] rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Eye className="w-5 h-5 text-[#11B32F]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#1E2939] leading-[20px] font-sans">
                View Reports
              </span>
              <span className="text-xs font-medium text-[#99A1AF] leading-[16px] font-sans mt-0.5">
                Generate estate reports
              </span>
            </div>
          </Link>

        </div>

        {/* Divider separator */}
        <hr className="border-[#EDEDED]" />

        {/* KPI Cards section (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          
          {/* Card: Active Workers */}
          <div className="p-5 bg-white border border-[#DBEAFE] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between h-[164px]">
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-[#EFF6FF] rounded-[14px] flex items-center justify-center text-[#2B7FFF]">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex flex-col mt-4">
              <span className="text-[24px] font-semibold text-[#1447E6] leading-[32px] font-sans">
                {activeWorkersCount.active}
              </span>
              <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
                Active Workers
              </span>
              <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                of {activeWorkersCount.total} total
              </span>
            </div>
          </div>

          {/* Card: Plucked (KG) */}
          <div className="p-5 bg-white border border-[#D0FAE5] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between h-[164px]">
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-[14px] flex items-center justify-center text-[#00BC7D]">
                <Leaf className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex flex-col mt-4">
              <span className="text-[24px] font-semibold text-[#007A55] leading-[32px] font-sans">
                {totalPluckedKg.toFixed(1)} KG
              </span>
              <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
                Plucked (KG)
              </span>
              <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                Leaf plucking total
              </span>
            </div>
          </div>

          {/* Card: Payroll */}
          <div className="p-5 bg-white border border-[#F3E8FF] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between h-[164px]">
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-[#FAF5FF] rounded-[14px] flex items-center justify-center text-[#AD46FF]">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex flex-col mt-4">
              <span className="text-[24px] font-semibold text-[#8200DB] leading-[32px] font-sans">
                LKR {totalPayroll.toLocaleString()}
              </span>
              <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
                Payroll
              </span>
              <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                {filteredAssignments.length} assignments
              </span>
            </div>
          </div>

          {/* Card: Expenses */}
          <div className="p-5 bg-white border border-[#FFEDD4] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between h-[164px]">
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-[#FFF7ED] rounded-[14px] flex items-center justify-center text-[#FF6900]">
                <DollarSign className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex flex-col mt-4">
              <span className="text-[24px] font-semibold text-[#CA3500] leading-[32px] font-sans">
                LKR {totalExpenses.toLocaleString()}
              </span>
              <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
                Expenses
              </span>
              <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                {filteredExpenses.length} expenses
              </span>
            </div>
          </div>

        </div>

        {/* Row 1 Grid: Bar Chart and Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
          
          {/* Bar Chart Container */}
          <div className="lg:col-span-2 p-5 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col h-[323px] justify-between">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-medium text-[#1E2939] leading-[27px] font-sans">
                  Payroll vs Expenses
                </span>
                <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                  Monthly trend for 2026
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-normal font-sans text-[#6A7282]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00C950]" />
                  <span>Payroll</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF6900]" />
                  <span>Expenses</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="relative flex-1 mt-6 flex gap-4 h-[190px]">
              {/* Y-axis Labels */}
              <div className="flex flex-col-reverse justify-between text-[10px] font-medium text-[#99A1AF] w-9 h-[150px] shrink-0 font-sans border-r border-[#EDEDED] pr-2">
                {barChartGridLines.map((line) => (
                  <span key={line} className="text-right">
                    {line >= 1000 ? `${(line / 1000).toFixed(0)}k` : line}
                  </span>
                ))}
              </div>

              {/* Bar charts workspace */}
              <div className="flex-1 flex justify-around items-end h-[150px] relative">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none">
                  {barChartGridLines.map((line) => (
                    <div key={line} className="w-full border-t border-dashed border-[#EDEDED] h-0" />
                  ))}
                </div>

                {/* Bars per Month */}
                {monthlyTrendsData.map((data) => {
                  const payrollHeight = (data.payroll / barChartMaxVal) * 100;
                  const expensesHeight = (data.expenses / barChartMaxVal) * 100;

                  return (
                    <div key={data.month} className="flex flex-col items-center gap-2 relative z-10 w-12">
                      <div className="flex items-end justify-center gap-1.5 h-[120px] w-full">
                        {/* Payroll Bar */}
                        <div
                          style={{ height: `${Math.max(payrollHeight, 2)}%` }}
                          className="w-3.5 bg-[#00C950] rounded-t-[4px] hover:brightness-95 transition-all group relative cursor-pointer"
                          title={`Payroll: LKR ${data.payroll.toLocaleString()}`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#1E2939] text-white text-[10px] font-sans px-2 py-1 rounded-sm shadow-md whitespace-nowrap z-25">
                            Payroll: LKR {data.payroll.toLocaleString()}
                          </div>
                        </div>

                        {/* Expenses Bar */}
                        <div
                          style={{ height: `${Math.max(expensesHeight, 2)}%` }}
                          className="w-3.5 bg-[#FF6900] rounded-t-[4px] hover:brightness-95 transition-all group relative cursor-pointer"
                          title={`Expenses: LKR ${data.expenses.toLocaleString()}`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#1E2939] text-white text-[10px] font-sans px-2 py-1 rounded-sm shadow-md whitespace-nowrap z-25">
                            Expenses: LKR {data.expenses.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#99A1AF] font-sans leading-none">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Upcoming Events Container */}
          <div className="p-5 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col h-[323px] justify-between">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-[#1E2939] leading-[27px] font-sans">
                Upcoming Events
              </span>
              <Link
                href="/dashboard/reminders"
                className="text-xs font-semibold text-[#00A63E] hover:text-[#009966] transition-colors flex items-center gap-1 font-sans"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Event List */}
            <div className="flex-1 mt-4 flex flex-col gap-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => {
                  const isRecurring = ev.recurrence && ev.recurrence !== "none";
                  return (
                    <div
                      key={ev.id}
                      className="p-3 bg-[#F9FAFB] rounded-[14px] hover:bg-gray-50 transition-colors flex items-start gap-3 border-l-4"
                      style={{ borderLeftColor: ev.color || "#05DF72" }}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold text-[#1E2939] truncate font-sans">
                          {ev.title}
                        </span>
                        <span className="text-xs font-medium text-[#99A1AF] mt-1 font-sans">
                          {ev.startDate}
                        </span>
                      </div>
                      {isRecurring && (
                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-semibold font-sans capitalize shrink-0 self-center">
                          {ev.recurrence}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 text-center text-gray-400">
                  <CalendarDays className="w-8 h-8 text-gray-300 mb-1" />
                  <span className="text-xs font-medium font-sans">No upcoming events scheduled</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Row 2 Grid: Harvest by Section and Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
          
          {/* Harvest by Section List */}
          <div className="p-5 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col min-h-[300px] justify-between">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-medium text-[#1E2939] leading-[27px] font-sans">
                  Harvest by Section
                </span>
                <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                  Leaf plucking KG — This Month
                </span>
              </div>
              <Link
                href="/dashboard/assignments"
                className="text-xs font-semibold text-[#00A63E] hover:text-[#009966] transition-colors flex items-center gap-1 font-sans"
              >
                <span>View assignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List with Progress Bars */}
            <div className="flex-1 mt-5 flex flex-col gap-4">
              {harvestBySection.length > 0 ? (
                harvestBySection.map((sec: any) => {
                  // We scale relative to a max target of 120 KG (Section C is 112.5, which will be ~93%)
                  const percentage = Math.min((sec.amount / 120) * 100, 100);
                  
                  return (
                    <div key={sec.id} className="flex flex-col w-full">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#364153] font-sans mb-1.5">
                        <span>{sec.name}</span>
                        <span className="text-gray-800 font-bold">{sec.amount.toFixed(1)} kg</span>
                      </div>
                      
                      {/* Custom Progress Bar container */}
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="h-full bg-[#00C950] rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 text-center text-gray-400">
                  <Leaf className="w-8 h-8 text-gray-300 mb-1" />
                  <span className="text-xs font-medium font-sans">No sections registered or no pluck data</span>
                </div>
              )}
            </div>

          </div>

          {/* Expense Breakdown Donut Chart */}
          <div className="p-5 bg-white border border-[#F3F4F6] rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col min-h-[300px] justify-between">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-medium text-[#1E2939] leading-[27px] font-sans">
                  Expense Breakdown
                </span>
                <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
                  By category — This Month
                </span>
              </div>
              <Link
                href="/dashboard/expenses"
                className="text-xs font-semibold text-[#00A63E] hover:text-[#009966] transition-colors flex items-center gap-1 font-sans"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Donut and Legend Body */}
            <div className="flex-1 mt-6 flex flex-col sm:flex-row items-center justify-center gap-8">
              
              {/* SVG Circular Donut Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg width="144" height="144" viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  {donutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-500 hover:stroke-[14px] cursor-pointer"
                      style={{ strokeLinecap: "round" }}
                    />
                  ))}
                </svg>
                {/* Donut inner text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#99A1AF] font-sans">
                    Total
                  </span>
                  <span className="text-xs font-bold text-gray-800 font-sans mt-0.5">
                    LKR {expenseBreakdown.grandTotal >= 1000 ? `${(expenseBreakdown.grandTotal / 1000).toFixed(0)}k` : expenseBreakdown.grandTotal}
                  </span>
                </div>
              </div>

              {/* Legend Summary */}
              <div className="flex-1 flex flex-col gap-3 w-full max-w-[240px]">
                {donutSegments.map((seg, idx) => {
                  const displayLabel = seg.category === "Other" ? "Others" : seg.category;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2 text-[#6A7282] font-semibold">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span>{displayLabel}</span>
                      </div>
                      <span className="text-gray-800 font-bold">
                        LKR {seg.value.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
