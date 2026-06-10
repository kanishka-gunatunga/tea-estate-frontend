import { useState } from 'react';
import { Sidebar, NavSection } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { EstateManagement } from './components/EstateManagement';
import { ServiceManagement } from './components/ServiceManagement';
import { DailyAssignment } from './components/DailyAssignment';
import { WorkerManagement } from './components/WorkerManagement';
import { Expenses } from './components/Expenses';
import { Reminders } from './components/Reminders';
import { Reports } from './components/Reports';

const sectionTitles: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  estates: 'Estate Management',
  services: 'Service Management',
  'daily-assignment': 'Daily Assignment',
  workers: 'Workers',
  expenses: 'Expenses',
  reminders: 'Reminders',
  reports: 'Reports',
};

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <UserManagement />;
      case 'estates': return <EstateManagement />;
      case 'services': return <ServiceManagement />;
      case 'daily-assignment': return <DailyAssignment />;
      case 'workers': return <WorkerManagement />;
      case 'expenses': return <Expenses />;
      case 'reminders': return <Reminders />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar active={activeSection} onNavigate={setActiveSection} />
      <main className="flex-1 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
}
