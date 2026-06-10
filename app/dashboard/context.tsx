"use client";

import { createContext, useContext, useState } from "react";
import { Estate } from "@/components/EstateManagement";
import { User } from "@/components/UserManagement";
import { Employee } from "@/components/EmployeeManagement";
import { Service } from "@/components/ServiceManagement";
import { DailyAssignment } from "@/components/DailyAssignment";
import { Expense } from "@/components/Expenses";
import { CalendarEvent } from "@/components/Reminders";

// --- Seed Data ---
const INITIAL_ESTATES: Estate[] = [
  {
    id: "estate-1",
    name: "Greenleaf Tea Estate",
    location: "Nuwara Eliya, Sri Lanka",
    mapsLink: "https://maps.google.com/?q=Nuwara+Eliya,+Sri+Lanka",
    area: 450,
    establishedYear: 2005,
    planter: "Carter Bator",
    supervisor: "Carter Bator",
    status: "active",
    sections: [
      { id: "sec-1", name: "Plantation A", area: 80, description: "North-facing hillside" },
      { id: "sec-2", name: "Plantation B", area: 120, description: "Valley floor" },
      { id: "sec-3", name: "Plantation C", area: 90, description: "South slope" },
      { id: "sec-4", name: "Plantation D", area: 60, description: "Upper elevation" },
    ],
  },
  {
    id: "estate-2",
    name: "Highland Gardens",
    location: "Badulla, Sri Lanka",
    mapsLink: "https://maps.google.com/?q=Badulla,+Sri+Lanka",
    area: 320,
    establishedYear: 2008,
    planter: "Carter Bator",
    supervisor: "Carter Bator",
    status: "active",
    sections: [
      { id: "sec-5", name: "Plantation X", area: 100, description: "Mist-covered heights" },
      { id: "sec-6", name: "Plantation Y", area: 110, description: "East slope river view" },
      { id: "sec-7", name: "Plantation Z", area: 110, description: "Rocky soil section" },
    ],
  },
  {
    id: "estate-3",
    name: "Misty Valley Estate",
    location: "Kandy, Sri Lanka",
    mapsLink: "https://maps.google.com/?q=Kandy,+Sri+Lanka",
    area: 280,
    establishedYear: 2012,
    planter: "Carter Bator",
    supervisor: "Carter Bator",
    status: "active",
    sections: [],
  },
];

const INITIAL_USERS: User[] = [
  {
    id: "user-1",
    name: "Lincoln Calzoni",
    email: "admin@greenleaf.com",
    phone: "+94 77 123 4567",
    role: "Administrator",
    registeredDate: "2020-01-15",
    status: "active",
  },
  {
    id: "user-2",
    name: "Corey Gouse",
    email: "planter@greenleaf.com",
    phone: "+94 71 234 5678",
    role: "Planter",
    registeredDate: "2019-03-20",
    status: "active",
  },
  {
    id: "user-3",
    name: "Randy Rhiel Madsen",
    email: "planter2@greenleaf.com",
    phone: "+94 76 345 6789",
    role: "Planter",
    registeredDate: "2018-06-10",
    status: "active",
  },
  {
    id: "user-4",
    name: "Corey Botosh",
    email: "supervisor1@greenleaf.com",
    phone: "+94 70 456 7890",
    role: "Supervisor",
    registeredDate: "2021-02-01",
    status: "active",
  },
  {
    id: "user-5",
    name: "Cooper Bergson",
    email: "supervisor2@greenleaf.com",
    phone: "+94 72 567 8901",
    role: "Supervisor",
    registeredDate: "2021-07-15",
    status: "active",
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP001",
    name: "Justin Workman",
    gender: "Male",
    phone: "+94 77 111 2233",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking", "Weeding"],
    nic: "453213234v",
    status: "active",
  },
  {
    id: "EMP002",
    name: "Emerson Herwitz",
    gender: "Female",
    phone: "+94 71 222 3344",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking"],
    nic: "453213234v",
    status: "active",
  },
  {
    id: "EMP003",
    name: "Emerson Dias",
    gender: "Male",
    phone: "+94 76 333 4455",
    estateId: "estate-1",
    serviceCategories: ["Weeding", "Pruning", "Leaf Plucking"],
    nic: "453213234v",
    status: "active",
  },
  {
    id: "EMP004",
    name: "Phillip Aminoff",
    gender: "Female",
    phone: "+94 70 444 5566",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking", "Pruning"],
    nic: "453213234v",
    status: "active",
  },
  {
    id: "EMP005",
    name: "Chance Dorwart",
    gender: "Male",
    phone: "+94 72 555 6677",
    estateId: "estate-2",
    serviceCategories: ["Fertilizing", "Pesticide Spraying", "Weeding"],
    nic: "453213234v",
    status: "active",
  },
  {
    id: "EMP006",
    name: "Lincoln Torff",
    gender: "Female",
    phone: "+94 78 666 7788",
    estateId: "estate-2",
    serviceCategories: ["Leaf Plucking", "Weeding"],
    nic: "453213234v",
    status: "active",
  },
  {
    id: "EMP007",
    name: "Angel Korsgaard",
    gender: "Male",
    phone: "+94 75 777 8899",
    estateId: "estate-1",
    serviceCategories: ["Weeding", "Pruning", "Leaf Plucking"],
    nic: "453213234v",
    status: "inactive",
  },
  {
    id: "EMP008",
    name: "Craig Vetrovs",
    gender: "Female",
    phone: "+94 79 888 9900",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking"],
    nic: "453213234v",
    status: "active",
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: "service-1",
    name: "Weeding",
    description: "Removal of weeds from plantation",
    status: "active",
    rate: 350,
    unitType: "Hours",
  },
  {
    id: "service-2",
    name: "Pruning",
    description: "Cutting back tea bushes",
    status: "active",
    rate: 400,
    unitType: "Hours",
  },
  {
    id: "service-3",
    name: "Fertilizing",
    description: "Application of fertilizer",
    status: "active",
    rate: 1200,
    unitType: "Acres",
  },
  {
    id: "service-4",
    name: "Pesticide Spraying",
    description: "Chemical pest control",
    status: "active",
    rate: 250,
    unitType: "Units",
  },
  {
    id: "service-5",
    name: "Irrigation",
    description: "Watering the plantation",
    status: "active",
    rate: 300,
    unitType: "Hours",
  },
  {
    id: "service-6",
    name: "Leaf Plucking",
    description: "Handpicking of tea leaves",
    status: "active",
    rate: 50,
    unitType: "KG",
  },
];

const INITIAL_ASSIGNMENTS: DailyAssignment[] = [
  {
    id: "da-1",
    date: "2026-06-15",
    estateId: "estate-1",
    sectionId: "sec-1",
    serviceId: "service-6",
    assignments: [
      { employeeId: "EMP001", unitsCompleted: 18.5, paymentAmount: 925 },
      { employeeId: "EMP002", unitsCompleted: 22.0, paymentAmount: 1100 },
      { employeeId: "EMP004", unitsCompleted: 15.5, paymentAmount: 775 },
    ],
    totalAmount: 2800,
    status: "approved",
  },
  {
    id: "da-2",
    date: "2026-06-15",
    estateId: "estate-1",
    sectionId: "sec-2",
    serviceId: "service-1",
    assignments: [
      { employeeId: "EMP003", unitsCompleted: 8, paymentAmount: 2800 },
      { employeeId: "EMP007", unitsCompleted: 7, paymentAmount: 2450 },
    ],
    totalAmount: 5250,
    status: "pending",
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "ex-1",
    date: "2026-05-28",
    category: "Transport",
    description: "Diesel for machinery",
    amount: 15000,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-2",
    date: "2026-05-29",
    category: "Tools",
    description: "Pruning shears replacement (12 units)",
    amount: 8400,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-3",
    date: "2026-05-30",
    category: "Utilities",
    description: "Fertilizer - NPK 50 bags",
    amount: 45000,
    estateId: "estate-1",
    sectionId: "sec-2",
    status: "pending",
  },
  {
    id: "ex-4",
    date: "2026-05-31",
    category: "Other",
    description: "Tractor service and repair",
    amount: 22000,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-5",
    date: "2026-05-28",
    category: "Transport",
    description: "Petrol for sprayers",
    amount: 6500,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-6",
    date: "2026-05-30",
    category: "Tools",
    description: "Irrigation pipe fittings",
    amount: 12000,
    estateId: "estate-1",
    status: "rejected",
  },
  {
    id: "ex-7",
    date: "2026-06-01",
    category: "Utilities",
    description: "Stationery and printing",
    amount: 3500,
    estateId: "estate-1",
    status: "pending",
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "ev-1",
    title: "Stand-up Meeting",
    description: "Daily assignment review with supervisors",
    startDate: "2026-06-01",
    recurrence: "none",
    color: "#0891b2",
    category: "Meeting",
  },
  {
    id: "ev-2",
    title: "Supervisor Check-in",
    description: "Weekly supervisor meeting with estate planters",
    startDate: "2026-06-03",
    recurrence: "weekly",
    color: "#9333ea",
    category: "Meeting",
  },
  {
    id: "ev-3",
    title: "Monthly Harvest Review",
    description: "Review harvest targets and actual output",
    startDate: "2026-06-05",
    recurrence: "monthly",
    color: "#16a34a",
    category: "Review",
    estateId: "estate-1",
  },
  {
    id: "ev-4",
    title: "Fertilizer Application - Section Alpha",
    description: "Apply NPK fertilizer to Section Alpha",
    startDate: "2026-06-08",
    recurrence: "none",
    color: "#2563eb",
    category: "Cultivation",
    estateId: "estate-1",
  },
  {
    id: "ev-5",
    title: "Pest Control - West Block",
    description: "Scheduled pesticide spraying",
    startDate: "2026-06-10",
    recurrence: "none",
    color: "#dc2626",
    category: "Maintenance",
    estateId: "estate-2",
  },
  {
    id: "ev-6",
    title: "Payroll Processing",
    description: "Process monthly worker payments",
    startDate: "2026-06-28",
    recurrence: "monthly",
    color: "#ea580c",
    category: "Finance",
  },
];

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  memberSince: string;
}

interface DashboardContextType {
  estates: Estate[];
  setEstates: React.Dispatch<React.SetStateAction<Estate[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  assignments: DailyAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<DailyAssignment[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardStateProvider({ children }: { children: React.ReactNode }) {
  const [estates, setEstates] = useState<Estate[]>(INITIAL_ESTATES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [assignments, setAssignments] = useState<DailyAssignment[]>(INITIAL_ASSIGNMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Carter Bator",
    email: "carter@greenleaf.com",
    phone: "+94 77 123 4567",
    address: "Colombo, Sri Lanka",
    role: "Administrator",
    memberSince: "2020-01-15",
  });

  return (
    <DashboardContext.Provider
      value={{
        estates,
        setEstates,
        users,
        setUsers,
        employees,
        setEmployees,
        services,
        setServices,
        assignments,
        setAssignments,
        expenses,
        setExpenses,
        events,
        setEvents,
        profile,
        setProfile,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardStateProvider");
  }
  return context;
}
