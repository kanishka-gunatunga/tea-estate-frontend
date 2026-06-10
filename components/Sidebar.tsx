import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChartColumn, DollarSign, Settings, SquareUserRound, Users, LayoutGrid, Database, HardDrive } from "lucide-react";

interface SidebarProps {
  activeView:
  | "dashboard"
  | "estates"
  | "users"
  | "employees"
  | "services"
  | "assignments"
  | "expenses"
  | "reminders"
  | "profile"
  | "reports"
  | "backups";
  onViewChange?: (
    view:
      | "dashboard"
      | "estates"
      | "users"
      | "employees"
      | "services"
      | "assignments"
      | "expenses"
      | "reminders"
      | "profile"
      | "reports"
      | "backups"
  ) => void;
  profile?: {
    name: string;
    role: string;
  };
}

type NavView =
  | "dashboard"
  | "estates"
  | "users"
  | "employees"
  | "services"
  | "assignments"
  | "expenses"
  | "reminders"
  | "reports"
  | "backups";

export default function Sidebar({ activeView, profile }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      router.push("/");
    }
  };

  // Helper to generate dynamic styles matching Figma rules
  const getButtonClass = (viewName: NavView) => {
    const isActive = activeView === viewName;
    return `flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-sm font-medium text-left transition-all cursor-pointer h-10 w-full group ${isActive
      ? "text-white bg-[#00A63E] shadow-[0px_10px_15px_-3px_rgba(13,84,43,0.4),0px_4px_6px_-4px_rgba(13,84,43,0.4)]"
      : "text-[#7BF1A8] hover:bg-emerald-950/20 hover:text-white"
      }`;
  };

  const getIconClass = (viewName: NavView) => {
    const isActive = activeView === viewName;
    return `w-5 h-5 transition-colors ${isActive ? "text-white" : "text-[#05DF72] group-hover:text-white"
      }`;
  };

  return (
    <aside
      className="w-64 h-full flex flex-col justify-between shadow-2xl relative z-10 shrink-0 text-white select-none font-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 65, 14, 0.95), rgba(0, 30, 6, 0.98)), url('/side-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div>
        {/* Sidebar Brand Logo Header */}
        <div className="flex items-center gap-3 px-4 py-[20px] h-[77px] border-b border-[#016630] box-border">
          <div className="w-9 h-9 bg-[#00C950] rounded-[14px] flex items-center justify-center shadow-md shadow-emerald-950/30">
            <Image src="/leaf.png" alt="Leaf logo" width={24} height={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-wide leading-[18px]">
              Tea Estate
            </span>
            <span className="text-xs font-normal text-[#05DF72] leading-[16px]">
              Management System
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-2 py-[16px]">
          {/* Navigation item: Dashboard (defaults to estates view click) */}
          <Link
            href="/dashboard"
            className={getButtonClass("dashboard")}
          >
            <LayoutGrid className={getIconClass("dashboard")} />
            <span>Dashboard</span>
          </Link>

          {/* Navigation item: Daily Assignment */}
          <Link href="/dashboard/assignments" className={getButtonClass("assignments")}>
            {/* <svg
              className={getIconClass("assignments")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg> */}
            <svg className={getIconClass("assignments")} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 1.66663H7.49999C7.03975 1.66663 6.66666 2.03972 6.66666 2.49996V4.16663C6.66666 4.62686 7.03975 4.99996 7.49999 4.99996H12.5C12.9602 4.99996 13.3333 4.62686 13.3333 4.16663V2.49996C13.3333 2.03972 12.9602 1.66663 12.5 1.66663Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.3333 3.33337H15C15.442 3.33337 15.866 3.50897 16.1785 3.82153C16.4911 4.13409 16.6667 4.55801 16.6667 5.00004V16.6667C16.6667 17.1087 16.4911 17.5327 16.1785 17.8452C15.866 18.1578 15.442 18.3334 15 18.3334H5.00001C4.55798 18.3334 4.13406 18.1578 3.8215 17.8452C3.50894 17.5327 3.33334 17.1087 3.33334 16.6667V5.00004C3.33334 4.55801 3.50894 4.13409 3.8215 3.82153C4.13406 3.50897 4.55798 3.33337 5.00001 3.33337H6.66668" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 9.16663H13.3333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 13.3334H13.3333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.66666 9.16663H6.67499" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.66666 13.3334H6.67499" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <span>Daily Assignment</span>
          </Link>

          {/* Navigation item: Estate Management */}
          <Link href="/dashboard/estates" className={getButtonClass("estates")}>
            {/* <svg
              className={getIconClass("estates")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
              />
            </svg> */}
            <svg className={getIconClass("estates")} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor" d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8" />
            </svg>
            <span>Estate Management</span>
          </Link>

          {/* Navigation item: User Management */}
          <Link href="/dashboard/users" className={getButtonClass("users")}>
            {/* <svg
              className={getIconClass("users")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg> */}
            <Users className={`${getIconClass("users")} w-5 h-5`} />
            <span>User Management</span>
          </Link>

          {/* Navigation item: Employee */}
          <Link href="/dashboard/employees" className={getButtonClass("employees")}>
            {/* <svg
              className={getIconClass("employees")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-3 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg> */}
            <SquareUserRound className={`${getIconClass("employees")} w-5 h-5`} />
            <span>Employee</span>
          </Link>

          {/* Navigation item: Service Management */}
          <Link href="/dashboard/services" className={getButtonClass("services")}>
            {/* <svg
              className={getIconClass("services")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg> */}
            <Settings className={`${getIconClass("services")} w-5 h-5`} />
            <span>Service Management</span>
          </Link>

          {/* Navigation item: Expenses */}
          <Link href="/dashboard/expenses" className={getButtonClass("expenses")}>
            {/* <svg
              className={getIconClass("expenses")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5"
              />
            </svg> */}
            <DollarSign className={`${getIconClass("expenses")} w-5 h-5`} />
            <span>Expenses</span>
          </Link>

          {/* Navigation item: Reminders */}
          <Link href="/dashboard/reminders" className={getButtonClass("reminders")}>
            {/* <svg
              className={getIconClass("reminders")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg> */}
            <Bell className={`${getIconClass("reminders")} w-5 h-5`} />
            <span>Reminders</span>
          </Link>

          {/* Navigation item: Reports */}
          <Link href="/dashboard/reports" className={getButtonClass("reports")}>
            {/* <svg
              className={getIconClass("reports")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2z"
              />
            </svg> */}
            <ChartColumn className={`${getIconClass("reports")} w-5 h-5`} />
            <span>Reports</span>
          </Link>

          {/* Navigation item: Backups */}
          <Link href="/dashboard/backups" className={getButtonClass("backups")}>
            <HardDrive className={`${getIconClass("backups")} w-5 h-5`} />
            <span>Backups</span>
          </Link>
        </nav>
      </div>

      {/* User Session Footer Container */}
      <div className="flex items-center justify-between px-3 py-4 h-[65px] border-t border-[#016630] box-border">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 cursor-pointer hover:bg-emerald-900/20 p-1.5 rounded-xl transition-all"
          title="View My Profile"
        >
          {/* User initials box avatar */}
          <div className="w-8 h-8 bg-[#00A63E] rounded-[10px] flex items-center justify-center font-bold text-xs text-white select-none shrink-0">
            {profile ? profile.name.split(" ").map((n) => n[0]).join("") : "CB"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white leading-[16px]">
              {profile ? profile.name : "Carter Bator"}
            </span>
            <span className="text-xs font-normal text-[#05DF72] leading-[16px] mt-0.5">
              {profile ? profile.role : "Administrator"}
            </span>
          </div>
        </Link>

        {/* Log out button */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#05DF72] hover:bg-red-900/30 hover:text-red-400 transition-colors cursor-pointer shrink-0"
          title="Sign Out"
        >
          <svg
            className="w-4 h-4 text-[#05DF72]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
