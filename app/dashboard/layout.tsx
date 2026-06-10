"use client";

import { DashboardStateProvider, useDashboardContext } from "./context";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { profile } = useDashboardContext();
  const pathname = usePathname() || "";

  // Map sub-route paths to Sidebar activeView enum values
  const resolveActiveView = () => {
    if (pathname.includes("/dashboard/assignments")) return "assignments";
    if (pathname.includes("/dashboard/estates")) return "estates";
    if (pathname.includes("/dashboard/users")) return "users";
    if (pathname.includes("/dashboard/employees")) return "employees";
    if (pathname.includes("/dashboard/services")) return "services";
    if (pathname.includes("/dashboard/expenses")) return "expenses";
    if (pathname.includes("/dashboard/reminders")) return "reminders";
    if (pathname.includes("/dashboard/reports")) return "reports";
    if (pathname.includes("/dashboard/profile")) return "profile";
    if (pathname.includes("/dashboard/backups")) return "backups";
    return "estates";
  };

  const activeView = resolveActiveView();

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] overflow-hidden select-none font-sans">
      {/* Sidebar navigation panel */}
      <Sidebar
        activeView={activeView}
        onViewChange={() => {}}
        profile={profile}
      />

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardStateProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardStateProvider>
  );
}
