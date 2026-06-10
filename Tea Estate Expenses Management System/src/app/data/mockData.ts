export type UserRole = 'admin' | 'planter' | 'supervisor' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  estateId?: string;
}

export interface Section {
  id: string;
  name: string;
  area: number;
  estateId: string;
  description?: string;
}

export interface Estate {
  id: string;
  name: string;
  location: string;
  mapsLink?: string;
  totalArea: number;
  planterId: string;
  supervisorId: string;
  established: string;
  status: 'active' | 'inactive';
}

export interface ServiceRate {
  id: string;
  serviceId: string;
  unit: string;
  ratePerUnit: number;
  effectiveDate: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
}

export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  joinDate: string;
  serviceCategories: string[];
  status: 'active' | 'inactive';
  estateId: string;
  gender: 'male' | 'female';
}

export interface WorkerAssignment {
  workerId: string;
  unitsCompleted: number;
  paymentAmount: number;
}

export interface DailyAssignment {
  id: string;
  date: string;
  estateId: string;
  sectionId: string;
  serviceId: string;
  serviceRateId: string;
  assignments: WorkerAssignment[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'completed';
  createdBy: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  estateId: string;
  sectionId?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  color: string;
  category: string;
  estateId?: string;
}

// Mock data
export const users: User[] = [
  { id: 'u1', name: 'Rajesh Kumar', email: 'admin@greenleaf.com', role: 'admin', phone: '+94 77 123 4567', status: 'active', joinDate: '2020-01-15' },
  { id: 'u2', name: 'Arjun Perera', email: 'planter@greenleaf.com', role: 'planter', phone: '+94 71 234 5678', status: 'active', joinDate: '2019-03-20', estateId: 'e1' },
  { id: 'u3', name: 'Sunitha Nair', email: 'planter2@highland.com', role: 'planter', phone: '+94 76 345 6789', status: 'active', joinDate: '2018-06-10', estateId: 'e2' },
  { id: 'u4', name: 'Krishnamurthy S', email: 'supervisor1@greenleaf.com', role: 'supervisor', phone: '+94 70 456 7890', status: 'active', joinDate: '2021-02-01', estateId: 'e1' },
  { id: 'u5', name: 'Meena Devi', email: 'supervisor2@highland.com', role: 'supervisor', phone: '+94 72 567 8901', status: 'active', joinDate: '2021-07-15', estateId: 'e2' },
  { id: 'u6', name: 'Ravi Shankar', email: 'emp1@greenleaf.com', role: 'employee', phone: '+94 78 678 9012', status: 'active', joinDate: '2022-01-10', estateId: 'e1' },
  { id: 'u7', name: 'Kamala Samy', email: 'emp2@greenleaf.com', role: 'employee', phone: '+94 75 789 0123', status: 'inactive', joinDate: '2022-03-05', estateId: 'e1' },
];

export const estates: Estate[] = [
  { id: 'e1', name: 'Greenleaf Tea Estate', location: 'Nuwara Eliya, Sri Lanka', mapsLink: 'https://maps.google.com/?q=Nuwara+Eliya+Sri+Lanka', totalArea: 450, planterId: 'u2', supervisorId: 'u4', established: '2005-04-12', status: 'active' },
  { id: 'e2', name: 'Highland Gardens', location: 'Badulla, Sri Lanka', mapsLink: 'https://maps.google.com/?q=Badulla+Sri+Lanka', totalArea: 320, planterId: 'u3', supervisorId: 'u5', established: '2008-09-22', status: 'active' },
  { id: 'e3', name: 'Misty Valley Estate', location: 'Kandy, Sri Lanka', mapsLink: '', totalArea: 280, planterId: 'u2', supervisorId: 'u4', established: '2012-01-30', status: 'inactive' },
];

export const sections: Section[] = [
  { id: 's1', name: 'Section Alpha', area: 80, estateId: 'e1', description: 'North-facing hillside' },
  { id: 's2', name: 'Section Beta', area: 120, estateId: 'e1', description: 'Valley floor' },
  { id: 's3', name: 'Section Gamma', area: 90, estateId: 'e1', description: 'South slope' },
  { id: 's4', name: 'North Hill', area: 60, estateId: 'e1', description: 'Upper elevation' },
  { id: 's5', name: 'East Block', area: 100, estateId: 'e2', description: 'Eastern plantation' },
  { id: 's6', name: 'West Block', area: 90, estateId: 'e2', description: 'Western plantation' },
  { id: 's7', name: 'Central Grove', area: 130, estateId: 'e2', description: 'Central area' },
];

export const services: Service[] = [
  { id: 'sv1', name: 'Leaf Plucking', description: 'Handpicking of tea leaves', category: 'harvesting', status: 'active' },
  { id: 'sv2', name: 'Weeding', description: 'Removal of weeds from plantation', category: 'maintenance', status: 'active' },
  { id: 'sv3', name: 'Pruning', description: 'Cutting back tea bushes', category: 'maintenance', status: 'active' },
  { id: 'sv4', name: 'Fertilizing', description: 'Application of fertilizer', category: 'cultivation', status: 'active' },
  { id: 'sv5', name: 'Pesticide Spraying', description: 'Chemical pest control', category: 'cultivation', status: 'active' },
  { id: 'sv6', name: 'Irrigation', description: 'Watering the plantation', category: 'maintenance', status: 'active' },
  { id: 'sv7', name: 'Soil Testing', description: 'Soil quality assessment', category: 'analysis', status: 'inactive' },
];

export const serviceRates: ServiceRate[] = [
  { id: 'r1', serviceId: 'sv1', unit: 'KG', ratePerUnit: 45, effectiveDate: '2024-01-01' },
  { id: 'r2', serviceId: 'sv1', unit: 'KG', ratePerUnit: 50, effectiveDate: '2025-01-01' },
  { id: 'r3', serviceId: 'sv2', unit: 'Hours', ratePerUnit: 350, effectiveDate: '2025-01-01' },
  { id: 'r4', serviceId: 'sv3', unit: 'Hours', ratePerUnit: 400, effectiveDate: '2025-01-01' },
  { id: 'r5', serviceId: 'sv4', unit: 'Acres', ratePerUnit: 1200, effectiveDate: '2025-01-01' },
  { id: 'r6', serviceId: 'sv5', unit: 'Units', ratePerUnit: 250, effectiveDate: '2025-01-01' },
  { id: 'r7', serviceId: 'sv6', unit: 'Hours', ratePerUnit: 300, effectiveDate: '2025-01-01' },
];

export const workers: Worker[] = [
  { id: 'w1', employeeId: 'EMP001', name: 'Muthu Selvam', phone: '+94 77 111 2233', address: 'Nuwara Eliya', dob: '1985-03-15', joinDate: '2018-06-01', serviceCategories: ['sv1', 'sv2'], status: 'active', estateId: 'e1', gender: 'male' },
  { id: 'w2', employeeId: 'EMP002', name: 'Lakshmi Devi', phone: '+94 71 222 3344', address: 'Nuwara Eliya', dob: '1990-07-22', joinDate: '2019-01-15', serviceCategories: ['sv1'], status: 'active', estateId: 'e1', gender: 'female' },
  { id: 'w3', employeeId: 'EMP003', name: 'Arumugam K', phone: '+94 76 333 4455', address: 'Nuwara Eliya', dob: '1982-11-08', joinDate: '2017-03-20', serviceCategories: ['sv2', 'sv3', 'sv4'], status: 'active', estateId: 'e1', gender: 'male' },
  { id: 'w4', employeeId: 'EMP004', name: 'Ponni Ammal', phone: '+94 70 444 5566', address: 'Nuwara Eliya', dob: '1995-02-14', joinDate: '2020-08-10', serviceCategories: ['sv1', 'sv3'], status: 'active', estateId: 'e1', gender: 'female' },
  { id: 'w5', employeeId: 'EMP005', name: 'Velayutham R', phone: '+94 72 555 6677', address: 'Badulla', dob: '1988-09-30', joinDate: '2019-05-01', serviceCategories: ['sv4', 'sv5', 'sv6'], status: 'active', estateId: 'e2', gender: 'male' },
  { id: 'w6', employeeId: 'EMP006', name: 'Kavitha S', phone: '+94 78 666 7788', address: 'Badulla', dob: '1992-12-05', joinDate: '2021-02-28', serviceCategories: ['sv1', 'sv2'], status: 'active', estateId: 'e2', gender: 'female' },
  { id: 'w7', employeeId: 'EMP007', name: 'Suresh Babu', phone: '+94 75 777 8899', address: 'Nuwara Eliya', dob: '1980-06-18', joinDate: '2016-11-10', serviceCategories: ['sv2', 'sv3', 'sv6'], status: 'inactive', estateId: 'e1', gender: 'male' },
  { id: 'w8', employeeId: 'EMP008', name: 'Thamilarasi P', phone: '+94 79 888 9900', address: 'Nuwara Eliya', dob: '1993-04-25', joinDate: '2022-01-05', serviceCategories: ['sv1'], status: 'active', estateId: 'e1', gender: 'female' },
];

export const dailyAssignments: DailyAssignment[] = [
  {
    id: 'da1', date: '2026-05-30', estateId: 'e1', sectionId: 's1', serviceId: 'sv1', serviceRateId: 'r2',
    assignments: [
      { workerId: 'w1', unitsCompleted: 18.5, paymentAmount: 925 },
      { workerId: 'w2', unitsCompleted: 22.0, paymentAmount: 1100 },
      { workerId: 'w4', unitsCompleted: 15.5, paymentAmount: 775 },
    ],
    totalAmount: 2800, status: 'approved', createdBy: 'u4'
  },
  {
    id: 'da2', date: '2026-05-30', estateId: 'e1', sectionId: 's2', serviceId: 'sv2', serviceRateId: 'r3',
    assignments: [
      { workerId: 'w3', unitsCompleted: 8, paymentAmount: 2800 },
      { workerId: 'w7', unitsCompleted: 7, paymentAmount: 2450 },
    ],
    totalAmount: 5250, status: 'pending', createdBy: 'u4'
  },
  {
    id: 'da3', date: '2026-05-31', estateId: 'e1', sectionId: 's1', serviceId: 'sv1', serviceRateId: 'r2',
    assignments: [
      { workerId: 'w1', unitsCompleted: 20.0, paymentAmount: 1000 },
      { workerId: 'w2', unitsCompleted: 19.5, paymentAmount: 975 },
      { workerId: 'w8', unitsCompleted: 17.0, paymentAmount: 850 },
    ],
    totalAmount: 2825, status: 'completed', createdBy: 'u4'
  },
];

export const expenses: Expense[] = [
  { id: 'ex1', date: '2026-05-28', category: 'Fuel', description: 'Diesel for machinery', amount: 15000, estateId: 'e1', status: 'approved', approvedBy: 'u2' },
  { id: 'ex2', date: '2026-05-29', category: 'Tools', description: 'Pruning shears replacement (12 units)', amount: 8400, estateId: 'e1', status: 'approved', approvedBy: 'u2' },
  { id: 'ex3', date: '2026-05-30', category: 'Chemicals', description: 'Fertilizer - NPK 50 bags', amount: 45000, estateId: 'e1', sectionId: 's2', status: 'pending' },
  { id: 'ex4', date: '2026-05-31', category: 'Maintenance', description: 'Tractor service and repair', amount: 22000, estateId: 'e1', status: 'approved', approvedBy: 'u2' },
  { id: 'ex5', date: '2026-05-28', category: 'Fuel', description: 'Petrol for sprayers', amount: 6500, estateId: 'e2', status: 'approved', approvedBy: 'u3' },
  { id: 'ex6', date: '2026-05-30', category: 'Tools', description: 'Irrigation pipe fittings', amount: 12000, estateId: 'e2', status: 'rejected' },
  { id: 'ex7', date: '2026-06-01', category: 'Office', description: 'Stationery and printing', amount: 3500, estateId: 'e1', status: 'pending' },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'ev1', title: 'Monthly Harvest Review', description: 'Review harvest targets and actual output', startDate: '2026-06-05', recurrence: 'monthly', color: '#16a34a', category: 'Review', estateId: 'e1' },
  { id: 'ev2', title: 'Fertilizer Application - Section Alpha', description: 'Apply NPK fertilizer to Section Alpha', startDate: '2026-06-08', recurrence: 'none', color: '#2563eb', category: 'Cultivation', estateId: 'e1' },
  { id: 'ev3', title: 'Supervisor Check-in', description: 'Weekly supervisor meeting with estate planters', startDate: '2026-06-03', recurrence: 'weekly', color: '#9333ea', category: 'Meeting' },
  { id: 'ev4', title: 'Pest Control - West Block', description: 'Scheduled pesticide spraying', startDate: '2026-06-10', recurrence: 'none', color: '#dc2626', category: 'Maintenance', estateId: 'e2' },
  { id: 'ev5', title: 'Payroll Processing', description: 'Process monthly worker payments', startDate: '2026-06-28', recurrence: 'monthly', color: '#ea580c', category: 'Finance' },
  { id: 'ev6', title: 'Daily Stand-up', description: 'Daily assignment review with supervisors', startDate: '2026-06-01', recurrence: 'daily', color: '#0891b2', category: 'Meeting' },
];

export const expenseCategories = ['Fuel', 'Tools', 'Chemicals', 'Maintenance', 'Office', 'Transport', 'Utilities', 'Other'];
export const serviceUnits = ['KG', 'Units', 'Hours', 'Acres', 'Bags', 'Liters', 'Days'];
export const serviceCategories = ['harvesting', 'maintenance', 'cultivation', 'analysis', 'transport'];

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  planter: 'Planter (Estate Owner)',
  supervisor: 'Field Supervisor',
  employee: 'Employee',
};

export const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  planter: 'bg-emerald-100 text-emerald-800',
  supervisor: 'bg-blue-100 text-blue-800',
  employee: 'bg-gray-100 text-gray-700',
};
