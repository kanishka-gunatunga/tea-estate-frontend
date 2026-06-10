"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Leaf, Users, Wallet, DollarSign, Calendar, Clock, ClipboardList, TrendingUp } from "lucide-react";
import { useDashboardContext } from "@/app/dashboard/context";

export default function TVDashboard() {
  const { estates, assignments, expenses, events, employees } = useDashboardContext();

  // Selected Estate state - default to Greenleaf Tea Estate
  const [selectedEstateId, setSelectedEstateId] = useState<string>("estate-1");

  // Clock States
  const [timeString, setTimeString] = useState("15:26:18");
  const [dateString, setDateString] = useState("Tuesday, June 9, 2026");

  // Ticking Clock logic
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString("en-US", { hour12: false }));
      setDateString(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered values based on the mockup date of "2026-06-09"
  const mockToday = "2026-06-09";

  const activeEstate = useMemo(() => {
    return estates.find((e) => e.id === selectedEstateId) || estates[0];
  }, [estates, selectedEstateId]);

  // Filters by selected estate (if not 'all')
  const filterByEstate = <T extends { estateId?: string }>(items: T[]): T[] => {
    if (selectedEstateId === "all") return items;
    return items.filter((item) => item.estateId === selectedEstateId);
  };

  const estateAssignments = useMemo(() => filterByEstate(assignments), [assignments, selectedEstateId]);
  const estateExpenses = useMemo(() => filterByEstate(expenses), [expenses, selectedEstateId]);

  // --- KPI Card 1: Today's Harvest ---
  const todayHarvestKg = useMemo(() => {
    // Approved Leaf Plucking assignments on June 9, 2026
    return estateAssignments
      .filter((da) => da.date === mockToday && da.serviceId === "service-6" && da.status === "approved")
      .reduce((sum, da) => {
        return sum + da.assignments.reduce((s, a) => s + a.unitsCompleted, 0);
      }, 0);
  }, [estateAssignments]);

  const monthHarvestKg = useMemo(() => {
    // Approved Leaf Plucking assignments in June 2026
    return estateAssignments
      .filter((da) => da.date.startsWith("2026-06") && da.serviceId === "service-6" && da.status === "approved")
      .reduce((sum, da) => {
        return sum + da.assignments.reduce((s, a) => s + a.unitsCompleted, 0);
      }, 0);
  }, [estateAssignments]);

  // --- KPI Card 2: Active Workers ---
  const activeWorkersMetrics = useMemo(() => {
    // Workers with active status assigned to the selected estate
    const estateEmployees = employees.filter((emp) => 
      selectedEstateId === "all" || emp.estateId === selectedEstateId
    );
    const activeCount = estateEmployees.filter((emp) => emp.status === "active").length;
    const totalCount = estateEmployees.length;
    return { active: activeCount, total: totalCount };
  }, [employees, selectedEstateId]);

  // --- KPI Card 3: Today's Payroll ---
  const todayPayrollMetrics = useMemo(() => {
    // Approved assignments on June 9, 2026
    const todayApproved = estateAssignments.filter((da) => da.date === mockToday && da.status === "approved");
    const amount = todayApproved.reduce((sum, da) => sum + da.totalAmount, 0);
    const workerAssignmentsCount = todayApproved.reduce((sum, da) => sum + da.assignments.length, 0);
    return { amount, count: workerAssignmentsCount };
  }, [estateAssignments]);

  // --- KPI Card 4: Expenses ---
  const todayExpensesMetrics = useMemo(() => {
    // Approved expenses on June 9, 2026
    const todayApproved = estateExpenses.filter((ex) => ex.date === mockToday && ex.status === "approved");
    const amount = todayApproved.reduce((sum, ex) => sum + ex.amount, 0);
    const count = todayApproved.length;
    return { amount, count };
  }, [estateExpenses]);

  // --- Horizontal Bar Chart: Section Harvest ---
  const sectionHarvestData = useMemo(() => {
    if (!activeEstate || !activeEstate.sections) return [];
    
    // In June 2026
    return activeEstate.sections.map((section) => {
      const pluckSum = estateAssignments
        .filter((da) => da.sectionId === section.id && da.serviceId === "service-6" && da.status === "approved" && da.date.startsWith("2026-06"))
        .reduce((sum, da) => {
          return sum + da.assignments.reduce((s, a) => s + a.unitsCompleted, 0);
        }, 0);

      return {
        id: section.id,
        name: section.name,
        amount: pluckSum,
      };
    });
  }, [activeEstate, estateAssignments]);

  // Ordered sections in Y-axis matching Figma:
  // Central Grove, Section Beta, East Block, West Block, Section Alpha, Section Gamma, North Hill
  const sortedSectionHarvest = useMemo(() => {
    const order = [
      "Central Grove",
      "Section Beta",
      "East Block",
      "West Block",
      "Section Alpha",
      "Section Gamma",
      "North Hill",
    ];
    return [...sectionHarvestData].sort((a, b) => {
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
  }, [sectionHarvestData]);

  // Segment colors for bars
  const barColors = [
    "#16A34A", // Central Grove (s7)
    "#059669", // Section Beta (s2)
    "#10B981", // East Block (s5)
    "#34D399", // West Block (s6)
    "#6EE7B7", // Section Alpha (s1)
    "#A7F3D0", // Section Gamma (s3)
    "#D1FAE5", // North Hill (s4)
  ];

  // --- Right Panel: Upcoming Events ---
  const upcomingEvents = useMemo(() => {
    const estateEvents = events.filter((ev) => 
      selectedEstateId === "all" || !ev.estateId || ev.estateId === selectedEstateId
    );
    // Filter events after/from mock Today June 9, 2026 and sort
    return [...estateEvents]
      .filter((ev) => ev.startDate >= "2026-06-08") // June 8 starts upcoming feed
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 3);
  }, [events, selectedEstateId]);

  // --- Right Panel: Recent Assignments ---
  const recentAssignments = useMemo(() => {
    // approved assignments excluding today (June 9)
    const recent = estateAssignments.filter((da) => da.date < mockToday && da.status === "approved");
    
    // Sort descending by date
    return [...recent]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  }, [estateAssignments]);

  // Helper to map service ID to human readable text
  const getServiceName = (id: string) => {
    if (id === "service-6") return "Leaf Plucking";
    if (id === "service-1") return "Weeding";
    if (id === "service-2") return "Pruning";
    if (id === "service-3") return "Fertilizing";
    return "Estate Maintenance";
  };

  // Helper to map section ID to human readable short label
  const getSectionShortLabel = (id: string) => {
    if (id === "sec-1") return "Section A";
    if (id === "sec-2") return "Section B";
    if (id === "sec-3") return "Section C";
    if (id === "sec-4") return "Section D";
    if (id === "sec-1-5") return "Section E";
    if (id === "sec-1-6") return "Section F";
    if (id === "sec-1-7") return "Section G";
    return "Section A";
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#030712] text-white overflow-hidden select-none font-sans">
      
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 h-[87px] bg-[#101828] border-b border-[#1E2939] box-border shrink-0">
        
        {/* Left side brand logo */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#00C950] rounded-[14px] flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white leading-[18px]">
                Tea Estate
              </span>
              <span className="text-xs font-normal text-[#05DF72] leading-[16px]">
                Management System
              </span>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-[#364153]" />

          {/* Estate Dropdown Selector */}
          <div className="relative">
            <select
              value={selectedEstateId}
              onChange={(e) => setSelectedEstateId(e.target.value)}
              className="appearance-none bg-[#1E2939] border border-[#364153] hover:border-gray-500 rounded-[10px] pl-3 pr-8 py-1.5 text-xs font-medium text-white focus:outline-none cursor-pointer font-sans h-[36px] w-[234px]"
            >
              <option value="all">All Estates Overview</option>
              {estates.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.name} Overview
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Right side live clock/date */}
        <div className="flex flex-col items-end shrink-0">
          <span className="font-mono font-bold text-[30px] leading-[36px] tracking-[-0.75px] text-white">
            {timeString}
          </span>
          <span className="text-xs font-normal text-[#99A1AF] leading-[16px] mt-0.5 font-sans">
            {dateString}
          </span>
        </div>
      </header>

      {/* KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-6 py-5 shrink-0 bg-[#030712]">
        
        {/* KPI 1: Today's Harvest */}
        <div className="bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col justify-between h-[138px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-medium tracking-[0.3px] text-[#99A1AF] uppercase font-sans">
              Today's Harvest
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-gradient-to-br from-[#00A63E] to-[#00BC7D] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col mt-3">
            <span className="text-[24px] font-bold text-white leading-[32px] font-sans">
              {todayHarvestKg} KG
            </span>
            <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
              {monthHarvestKg.toFixed(1)} KG this month
            </span>
          </div>
        </div>

        {/* KPI 2: Active Workers */}
        <div className="bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col justify-between h-[138px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-medium tracking-[0.3px] text-[#99A1AF] uppercase font-sans">
              Active Workers
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-gradient-to-br from-[#155DFC] to-[#2B7FFF] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col mt-3">
            <span className="text-[24px] font-bold text-white leading-[32px] font-sans">
              {activeWorkersMetrics.active}
            </span>
            <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
              of {activeWorkersMetrics.total} total assigned
            </span>
          </div>
        </div>

        {/* KPI 3: Today's Payroll */}
        <div className="bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col justify-between h-[138px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-medium tracking-[0.3px] text-[#99A1AF] uppercase font-sans">
              Today's Payroll
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-gradient-to-br from-[#9810FA] to-[#AD46FF] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col mt-3">
            <span className="text-[24px] font-bold text-white leading-[32px] font-sans">
              LKR {todayPayrollMetrics.amount.toLocaleString()}
            </span>
            <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
              {todayPayrollMetrics.count} assignments today
            </span>
          </div>
        </div>

        {/* KPI 4: Expenses */}
        <div className="bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col justify-between h-[138px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-medium tracking-[0.3px] text-[#99A1AF] uppercase font-sans">
              Expenses
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-gradient-to-br from-[#FF6900] to-[#FE9A00] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col mt-3">
            <span className="text-[24px] font-bold text-white leading-[32px] font-sans">
              LKR {todayExpensesMetrics.amount.toLocaleString()}
            </span>
            <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
              {todayExpensesMetrics.count} expenses today
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid Content (Left Chart, Right Panels) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6 min-h-0 bg-[#030712]">
        
        {/* Left Side: Horizontal Bar Chart Card */}
        <div className="lg:col-span-2 bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col justify-between h-full min-h-0">
          
          {/* Chart Header */}
          <div className="flex items-center justify-between shrink-0 mb-4">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white leading-[24px] font-sans">
                Section Harvest — June 2026
              </span>
              <span className="text-xs font-normal text-[#6A7282] leading-[16px] mt-1 font-sans">
                Leaf plucking KG per section · Total: {monthHarvestKg.toFixed(1)} KG
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6A7282] font-sans">
              <TrendingUp className="w-4 h-4 text-[#00C950]" />
              <span>This Month</span>
            </div>
          </div>

          {/* Chart Workspace Area */}
          <div className="flex-1 flex gap-5 relative min-h-0 select-none mt-2">
            
            {/* Y-axis Labels */}
            <div className="flex flex-col justify-between text-xs font-medium text-[#9CA3AF] w-[100px] h-full pr-3 shrink-0 text-right font-sans py-1">
              {sortedSectionHarvest.map((item) => (
                <div key={item.id} className="truncate h-8 flex items-center justify-end">
                  {item.name}
                </div>
              ))}
            </div>

            {/* Bars container */}
            <div className="flex-1 flex flex-col justify-between h-full relative pr-6">
              
              {/* Vertical Dashed Gridlines (0, 150, 300, 450, 600 kg) */}
              <div className="absolute inset-x-0 inset-y-0 flex justify-between pointer-events-none z-0">
                {[0, 150, 300, 450, 600].map((label) => (
                  <div key={label} className="h-full border-l border-dashed border-[#1F2937] w-0" />
                ))}
              </div>

              {/* Horizontal Bars */}
              <div className="h-full flex flex-col justify-between relative z-10 py-1.5">
                {sortedSectionHarvest.map((item, idx) => {
                  // Max target weight is 600 kg for scaling
                  const widthPercentage = Math.min((item.amount / 600) * 100, 100);
                  const color = barColors[idx % barColors.length];
                  
                  return (
                    <div key={item.id} className="flex items-center h-8">
                      <div
                        className="h-4 rounded-r-md transition-all duration-500 hover:brightness-110 cursor-pointer group relative"
                        style={{ backgroundColor: color, width: `${Math.max(widthPercentage, 1.5)}%` }}
                      >
                        {/* Interactive Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#1E2939] text-white text-[10px] font-sans px-2 py-1 rounded-sm shadow-md whitespace-nowrap z-20">
                          {item.name}: {item.amount.toFixed(1)} kg
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Grid X-axis Labels */}
          <div className="flex pl-[120px] pr-6 justify-between text-[11px] text-[#6B7280] font-sans font-normal border-t border-[#1E2939] pt-2 mb-2">
            <span>0kg</span>
            <span>150kg</span>
            <span>300kg</span>
            <span>450kg</span>
            <span>600kg</span>
          </div>

          {/* Legend Grid Footer */}
          <div className="grid grid-cols-4 gap-y-3 gap-x-4 border-t border-[#1E2939] pt-4 select-none shrink-0">
            {sortedSectionHarvest.map((item, idx) => {
              const displayLabel = getSectionShortLabel(item.id);
              return (
                <div key={item.id} className="flex items-center gap-2 text-xs font-sans">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: barColors[idx % barColors.length] }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[#6A7282] font-medium leading-none">
                      {displayLabel}
                    </span>
                    <span className="text-[#05DF72] font-semibold mt-1">
                      {item.amount.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Feed Container */}
        <div className="flex flex-col gap-5 h-full min-h-0">
          
          {/* Section 1: Upcoming Events */}
          <div className="bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col flex-[4] min-h-0 justify-between">
            <div className="flex items-center gap-2 shrink-0 pb-3 border-b border-[#1E2939]">
              <Calendar className="w-4 h-4 text-[#51A2FF]" />
              <span className="text-sm font-semibold text-white font-sans">
                Upcoming Events
              </span>
            </div>

            {/* List */}
            <div className="flex-1 mt-3.5 flex flex-col gap-2 overflow-y-auto tv-scrollbar">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-[#1E2939] rounded-[14px] hover:bg-slate-800 transition-colors flex items-start gap-3"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: ev.color || "#05DF72" }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#E5E7EB] truncate font-sans">
                        {ev.title}
                      </span>
                      <span className="text-xs font-normal text-[#6A7282] mt-1 font-sans">
                        {ev.startDate}
                      </span>
                    </div>
                    {ev.recurrence && ev.recurrence !== "none" && (
                      <span className="px-2 py-0.5 bg-[rgba(28,57,142,0.4)] border border-blue-500/20 text-[#51A2FF] rounded-[4px] text-[10px] font-sans font-medium capitalize shrink-0 self-center">
                        {ev.recurrence}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 text-[#6A7282] text-center">
                  <span className="text-xs font-medium font-sans">No upcoming events</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Recent Assignments */}
          <div className="bg-[#101828] border border-[#1E2939] rounded-[16px] p-5 flex flex-col flex-[5] min-h-0 justify-between">
            <div className="flex items-center gap-2 shrink-0 pb-3 border-b border-[#1E2939]">
              <ClipboardList className="w-4 h-4 text-[#C27AFF]" />
              <span className="text-sm font-semibold text-white font-sans">
                Recent Assignments
              </span>
            </div>

            {/* List */}
            <div className="flex-1 mt-3.5 flex flex-col gap-2 overflow-y-auto tv-scrollbar">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((da) => {
                  const serviceName = getServiceName(da.serviceId);
                  const sectionLabel = getSectionShortLabel(da.sectionId || "");
                  const isHarvest = da.serviceId === "service-6";
                  
                  return (
                    <div
                      key={da.id}
                      className="p-3 bg-[#1E2939] rounded-[14px] hover:bg-slate-800 transition-colors flex items-center justify-between"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#E5E7EB] truncate font-sans">
                          {serviceName}
                        </span>
                        <span className="text-[11px] font-normal text-[#6A7282] mt-1 font-sans">
                          {da.assignments.length} workers
                        </span>
                        <span className="text-[11px] font-normal text-[#4A5565] mt-1 font-sans">
                          {da.date}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className="px-2 py-0.5 text-[10px] font-sans font-medium rounded-[3.35544e+07px] text-[#D1D5DC]"
                          style={{
                            backgroundColor: isHarvest ? "rgba(28, 57, 142, 0.6)" : "rgba(142, 45, 28, 0.6)",
                          }}
                        >
                          {sectionLabel}
                        </span>
                        <span className="text-xs font-semibold text-[#05DF72] font-sans">
                          LKR {da.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 text-[#6A7282] text-center">
                  <span className="text-xs font-medium font-sans">No recent assignments</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
