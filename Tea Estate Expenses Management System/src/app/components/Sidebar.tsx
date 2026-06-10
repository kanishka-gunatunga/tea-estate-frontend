import { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Settings, ClipboardList,
  UserSquare2, DollarSign, Bell, BarChart3, ChevronRight,
  ChevronLeft, Leaf, LogOut, TreePine
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'users'
  | 'estates'
  | 'services'
  | 'daily-assignment'
  | 'workers'
  | 'expenses'
  | 'reminders'
  | 'reports';

interface SidebarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
}

const navItems = [
  { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'estates' as NavSection, label: 'Estate Management', icon: Building2 },
  { id: 'users' as NavSection, label: 'User Management', icon: Users },
  { id: 'workers' as NavSection, label: 'Workers', icon: UserSquare2 },
  { id: 'services' as NavSection, label: 'Service Management', icon: Settings },
  { id: 'daily-assignment' as NavSection, label: 'Daily Assignment', icon: ClipboardList },
  { id: 'expenses' as NavSection, label: 'Expenses', icon: DollarSign },
  { id: 'reminders' as NavSection, label: 'Reminders', icon: Bell },
  { id: 'reports' as NavSection, label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col h-full bg-gradient-to-b from-green-900 to-green-950
        transition-all duration-300 ease-in-out shadow-xl
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-green-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-9 h-9 bg-green-500 rounded-xl flex-shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-semibold text-sm leading-tight">TeaEstate</p>
            <p className="text-green-400 text-xs">Management System</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 z-10 w-6 h-6 rounded-full bg-green-700 border-2 border-green-900 flex items-center justify-center hover:bg-green-600 transition-colors"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-white" />
          : <ChevronLeft className="w-3 h-3 text-white" />
        }
      </button>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                ${isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/40'
                  : 'text-green-300 hover:bg-green-800 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-green-400 group-hover:text-white'}`} />
              {!collapsed && (
                <span className="text-sm truncate">{label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-300" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={`px-3 py-4 border-t border-green-800`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Rajesh Kumar</p>
              <p className="text-green-400 text-xs truncate">Administrator</p>
            </div>
          )}
          {!collapsed && (
            <button className="text-green-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
