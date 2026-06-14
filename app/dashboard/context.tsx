"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Estate } from "@/components/EstateManagement";
import { User } from "@/components/UserManagement";
import { Employee } from "@/components/EmployeeManagement";
import { Service } from "@/components/ServiceManagement";
import { DailyAssignment } from "@/components/DailyAssignment";
import { Expense } from "@/components/Expenses";
import { CalendarEvent } from "@/components/Reminders";
import {
  useEstatesQuery,
  useCreateEstateMutation,
  useUpdateEstateMutation,
  useDeleteEstateMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useUpdateAssignmentStatusMutation,
  useAddWorkerMutation,
  useUpdateWorkerMutation,
  useRemoveWorkerMutation,
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/hooks/hooks";

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
      { id: "sec-1", name: "Central Grove", area: 80, description: "North-facing hillside" },
      { id: "sec-2", name: "Section Beta", area: 120, description: "Valley floor" },
      { id: "sec-3", name: "East Block", area: 90, description: "South slope" },
      { id: "sec-4", name: "West Block", area: 60, description: "Upper elevation" },
      { id: "sec-1-5", name: "Section Alpha", area: 70, description: "North boundary" },
      { id: "sec-1-6", name: "Section Gamma", area: 65, description: "South boundary" },
      { id: "sec-1-7", name: "North Hill", area: 50, description: "Upper terrace" },
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
    status: "active",
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
  {
    id: "EMP009",
    name: "Gihan Perera",
    gender: "Male",
    phone: "+94 77 999 0011",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking"],
    nic: "951234567v",
    status: "active",
  },
  {
    id: "EMP010",
    name: "Nilanthi Silva",
    gender: "Female",
    phone: "+94 77 999 0022",
    estateId: "estate-1",
    serviceCategories: ["Fertilizing"],
    nic: "961234567v",
    status: "active",
  },
  {
    id: "EMP011",
    name: "Saman Kumara",
    gender: "Male",
    phone: "+94 77 999 0033",
    estateId: "estate-1",
    serviceCategories: ["Fertilizing"],
    nic: "971234567v",
    status: "active",
  },
  {
    id: "EMP012",
    name: "Ruwan Bandara",
    gender: "Male",
    phone: "+94 77 999 0044",
    estateId: "estate-1",
    serviceCategories: ["Fertilizing"],
    nic: "981234567v",
    status: "active",
  },
  {
    id: "EMP013",
    name: "Priyanka Fernando",
    gender: "Female",
    phone: "+94 77 999 0055",
    estateId: "estate-1",
    serviceCategories: ["Fertilizing"],
    nic: "991234567v",
    status: "active",
  },
  {
    id: "EMP014",
    name: "Dilrukshi Senanayake",
    gender: "Female",
    phone: "+94 77 999 0066",
    estateId: "estate-1",
    serviceCategories: ["Fertilizing"],
    nic: "941234567v",
    status: "active",
  },
  {
    id: "EMP015",
    name: "Kanishka Ranasinghe",
    gender: "Male",
    phone: "+94 77 999 0077",
    estateId: "estate-1",
    serviceCategories: ["Weeding"],
    nic: "931234567v",
    status: "active",
  },
  {
    id: "EMP016",
    name: "Udaya Karunaratne",
    gender: "Male",
    phone: "+94 77 999 0088",
    estateId: "estate-1",
    serviceCategories: ["Pruning"],
    nic: "921234567v",
    status: "active",
  },
  {
    id: "EMP017",
    name: "Manel Jayasinghe",
    gender: "Female",
    phone: "+94 77 999 0099",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking"],
    nic: "911234567v",
    status: "active",
  },
  {
    id: "EMP018",
    name: "Nimal Sirisena",
    gender: "Male",
    phone: "+94 77 999 0100",
    estateId: "estate-1",
    serviceCategories: ["Leaf Plucking"],
    nic: "901234567v",
    status: "active",
  },
  {
    id: "EMP019",
    name: "Sunil Perera",
    gender: "Male",
    phone: "+94 77 999 0200",
    estateId: "estate-1",
    serviceCategories: ["Weeding"],
    nic: "891234567v",
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
  // Jan 2026 (Payroll target: 180,000)
  {
    id: "da-jan",
    date: "2026-01-15",
    estateId: "estate-1",
    sectionId: "sec-1",
    serviceId: "service-2",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 450, paymentAmount: 180000 }],
    totalAmount: 180000,
    status: "approved",
  },
  // Feb 2026 (Payroll target: 160,000)
  {
    id: "da-feb",
    date: "2026-02-15",
    estateId: "estate-1",
    sectionId: "sec-2",
    serviceId: "service-2",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 400, paymentAmount: 160000 }],
    totalAmount: 160000,
    status: "approved",
  },
  // Mar 2026 (Payroll target: 190,000)
  {
    id: "da-mar",
    date: "2026-03-15",
    estateId: "estate-1",
    sectionId: "sec-3",
    serviceId: "service-2",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 475, paymentAmount: 190000 }],
    totalAmount: 190000,
    status: "approved",
  },
  // Apr 2026 (Payroll target: 210,000)
  {
    id: "da-apr",
    date: "2026-04-15",
    estateId: "estate-1",
    sectionId: "sec-4",
    serviceId: "service-2",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 525, paymentAmount: 210000 }],
    totalAmount: 210000,
    status: "approved",
  },
  // May 2026 (Payroll target: 230,000)
  {
    id: "da-may",
    date: "2026-05-15",
    estateId: "estate-1",
    sectionId: "sec-1",
    serviceId: "service-2",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 575, paymentAmount: 230000 }],
    totalAmount: 230000,
    status: "approved",
  },
  // Recent Assignments matching TV Dashboard list (May 30 - 31)
  // Leaf Plucking, 3 workers, 2026-05-31, Section A (Central Grove), LKR 3,825
  {
    id: "da-rec-1",
    date: "2026-05-31",
    estateId: "estate-1",
    sectionId: "sec-1",
    serviceId: "service-6",
    assignments: [
      { employeeId: "EMP001", unitsCompleted: 25.5, paymentAmount: 1275 },
      { employeeId: "EMP002", unitsCompleted: 25.5, paymentAmount: 1275 },
      { employeeId: "EMP008", unitsCompleted: 25.5, paymentAmount: 1275 },
    ],
    totalAmount: 3825,
    status: "approved",
  },
  // Leaf Plucking, 3 workers, 2026-05-30, Section B (Section Beta), LKR 2,825
  {
    id: "da-rec-2",
    date: "2026-05-30",
    estateId: "estate-1",
    sectionId: "sec-2",
    serviceId: "service-6",
    assignments: [
      { employeeId: "EMP003", unitsCompleted: 20.0, paymentAmount: 1000 },
      { employeeId: "EMP004", unitsCompleted: 20.0, paymentAmount: 1000 },
      { employeeId: "EMP008", unitsCompleted: 16.5, paymentAmount: 825 },
    ],
    totalAmount: 2825,
    status: "approved",
  },
  // Weeding, 2 workers, 2026-05-30, Section A (Central Grove), LKR 2,825
  {
    id: "da-rec-3",
    date: "2026-05-30",
    estateId: "estate-1",
    sectionId: "sec-1",
    serviceId: "service-1",
    assignments: [
      { employeeId: "EMP001", unitsCompleted: 4.0, paymentAmount: 1400 },
      { employeeId: "EMP002", unitsCompleted: 4.07, paymentAmount: 1425 },
    ],
    totalAmount: 2825,
    status: "approved",
  },
  // June 9, 2026 Today's Data
  // - Today's Harvest: 112 KG (approved plucking, 8 workers, LKR 5,600)
  // - Today's Payroll: LKR 122,800
  // - Total worker assignments: 13 (8 plucking + 5 fertilizing, fertilizing payment LKR 117,200)
  {
    id: "da-jun9-plucking",
    date: "2026-06-09",
    estateId: "estate-1",
    sectionId: "sec-1", // Central Grove
    serviceId: "service-6",
    assignments: [
      { employeeId: "EMP001", unitsCompleted: 15.0, paymentAmount: 750 },
      { employeeId: "EMP002", unitsCompleted: 14.0, paymentAmount: 700 },
      { employeeId: "EMP003", unitsCompleted: 16.0, paymentAmount: 800 },
      { employeeId: "EMP004", unitsCompleted: 15.0, paymentAmount: 750 },
      { employeeId: "EMP008", unitsCompleted: 15.0, paymentAmount: 750 },
      { employeeId: "EMP009", unitsCompleted: 14.0, paymentAmount: 700 },
      { employeeId: "EMP017", unitsCompleted: 13.0, paymentAmount: 650 },
      { employeeId: "EMP018", unitsCompleted: 10.0, paymentAmount: 500 },
    ],
    totalAmount: 5600,
    status: "approved",
  },
  {
    id: "da-jun9-fertilizing",
    date: "2026-06-09",
    estateId: "estate-1",
    sectionId: "sec-2", // Section Beta
    serviceId: "service-3",
    assignments: [
      { employeeId: "EMP010", unitsCompleted: 20.0, paymentAmount: 24000 },
      { employeeId: "EMP011", unitsCompleted: 20.0, paymentAmount: 24000 },
      { employeeId: "EMP012", unitsCompleted: 20.0, paymentAmount: 24000 },
      { employeeId: "EMP013", unitsCompleted: 20.0, paymentAmount: 24000 },
      { employeeId: "EMP014", unitsCompleted: 21.0, paymentAmount: 25200 },
    ],
    totalAmount: 117200,
    status: "approved",
  },
  // June 2026 Section Harvest Totals (Overall Target: 2595.5 KG total pluck)
  // Section 1 (Central Grove): Total 521.0 KG. Jun 9 has 112.0 KG => we add 409.0 KG.
  {
    id: "da-jun-sec1",
    date: "2026-06-15",
    estateId: "estate-1",
    sectionId: "sec-1",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP001", unitsCompleted: 409.0, paymentAmount: 20450 }],
    totalAmount: 20450,
    status: "approved",
  },
  // Section 2 (Section Beta): Total 487.0 KG.
  {
    id: "da-jun-sec2",
    date: "2026-06-16",
    estateId: "estate-1",
    sectionId: "sec-2",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP002", unitsCompleted: 487.0, paymentAmount: 24350 }],
    totalAmount: 24350,
    status: "approved",
  },
  // Section 3 (East Block): Total 412.0 KG.
  {
    id: "da-jun-sec3",
    date: "2026-06-17",
    estateId: "estate-1",
    sectionId: "sec-3",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 412.0, paymentAmount: 20600 }],
    totalAmount: 20600,
    status: "approved",
  },
  // Section 4 (West Block): Total 378.5 KG.
  {
    id: "da-jun-sec4",
    date: "2026-06-18",
    estateId: "estate-1",
    sectionId: "sec-4",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP004", unitsCompleted: 378.5, paymentAmount: 18925 }],
    totalAmount: 18925,
    status: "approved",
  },
  // Section 5 (Section Alpha): Total 342.5 KG.
  {
    id: "da-jun-sec5",
    date: "2026-06-19",
    estateId: "estate-1",
    sectionId: "sec-1-5",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP008", unitsCompleted: 342.5, paymentAmount: 17125 }],
    totalAmount: 17125,
    status: "approved",
  },
  // Section 6 (Section Gamma): Total 298.5 KG.
  {
    id: "da-jun-sec6",
    date: "2026-06-20",
    estateId: "estate-1",
    sectionId: "sec-1-6",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP009", unitsCompleted: 298.5, paymentAmount: 14925 }],
    totalAmount: 14925,
    status: "approved",
  },
  // Section 7 (North Hill): Total 156.0 KG.
  {
    id: "da-jun-sec7",
    date: "2026-06-21",
    estateId: "estate-1",
    sectionId: "sec-1-7",
    serviceId: "service-6",
    assignments: [{ employeeId: "EMP017", unitsCompleted: 156.0, paymentAmount: 7800 }],
    totalAmount: 7800,
    status: "approved",
  },
  // Weeding approved assignment to reach June payroll chart target (90,000 LKR)
  {
    id: "da-jun-weeding-approved",
    date: "2026-06-12",
    estateId: "estate-1",
    sectionId: "sec-2",
    serviceId: "service-1",
    assignments: [{ employeeId: "EMP003", unitsCompleted: 50.0, paymentAmount: 17500 }],
    totalAmount: 17500,
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
  // Jan 2026 (Target: 100,000)
  {
    id: "ex-jan-1",
    date: "2026-01-20",
    category: "Utilities",
    description: "Electricity and Water Bill",
    amount: 100000,
    estateId: "estate-1",
    status: "approved",
  },
  // Feb 2026 (Target: 90,000)
  {
    id: "ex-feb-1",
    date: "2026-02-20",
    category: "Transport",
    description: "Monthly tractor fuel and leasing",
    amount: 90000,
    estateId: "estate-1",
    status: "approved",
  },
  // Mar 2026 (Target: 110,000)
  {
    id: "ex-mar-1",
    date: "2026-03-20",
    category: "Tools",
    description: "New agricultural equipment purchase",
    amount: 110000,
    estateId: "estate-1",
    status: "approved",
  },
  // Apr 2026 (Target: 100,000)
  {
    id: "ex-apr-1",
    date: "2026-04-20",
    category: "Other",
    description: "Fertilizer sprayers repair and servicing",
    amount: 100000,
    estateId: "estate-1",
    status: "approved",
  },
  // May 2026 (Target: 115,000 - 51,900 existing approved = 63,100 extra)
  {
    id: "ex-may-extra",
    date: "2026-05-20",
    category: "Utilities",
    description: "Factory water purification filters replacement",
    amount: 63100,
    estateId: "estate-1",
    status: "approved",
  },
  // Original May Expenses
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
  // June 9, 2026 Mock "Today's" Expenses (Total: 12,000 LKR across 3 entries)
  {
    id: "ex-jun9-1",
    date: "2026-06-09",
    category: "Transport",
    description: "Leaf collection truck diesel fuel",
    amount: 4500,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-jun9-2",
    date: "2026-06-09",
    category: "Tools",
    description: "Plucking shears sharpening service",
    amount: 3500,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-jun9-3",
    date: "2026-06-09",
    category: "Other",
    description: "Supervisor site visit transport allowance",
    amount: 4000,
    estateId: "estate-1",
    status: "approved",
  },
  // June 2026 (Target: 424,000 for donut breakdown)
  // - Utilities: LKR 234,000 (ex-7 pending 3,500 + approved 230,500)
  // - Transport: LKR 100,000 (ex-jun9-1 4,500 + approved 95,500)
  // - Tools: LKR 56,000 (ex-jun9-2 3,500 + approved 52,500)
  // - Others: LKR 34,000 (ex-jun9-3 4,000 + approved 30,000)
  {
    id: "ex-7",
    date: "2026-06-01",
    category: "Utilities",
    description: "Stationery and printing",
    amount: 3500,
    estateId: "estate-1",
    status: "pending",
  },
  {
    id: "ex-jun-util",
    date: "2026-06-02",
    category: "Utilities",
    description: "Factory power supply and grid connection",
    amount: 230500,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-jun-trans",
    date: "2026-06-03",
    category: "Transport",
    description: "Truck maintenance services",
    amount: 95500,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-jun-tools",
    date: "2026-06-04",
    category: "Tools",
    description: "Automated pluckers purchase",
    amount: 52500,
    estateId: "estate-1",
    status: "approved",
  },
  {
    id: "ex-jun-other",
    date: "2026-06-05",
    category: "Other",
    description: "Soil nutrition tests",
    amount: 30000,
    estateId: "estate-1",
    status: "approved",
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
  // Query data from backend
  const { data: serverEstates, isLoading: isLoadingEstates } = useEstatesQuery();
  const { data: serverUsers, isLoading: isLoadingUsers } = useUsersQuery();
  const { data: serverEmployees, isLoading: isLoadingEmployees } = useEmployeesQuery();
  const { data: serverServices, isLoading: isLoadingServices } = useServicesQuery();
  const { data: serverAssignments, isLoading: isLoadingAssignments } = useAssignmentsQuery();
  const { data: serverExpenses, isLoading: isLoadingExpenses } = useExpensesQuery();
  const { data: serverEvents, isLoading: isLoadingEvents } = useEventsQuery();
  const { data: serverProfile, isLoading: isLoadingProfile } = useProfileQuery();

  const isLoading = isLoadingEstates || isLoadingUsers || isLoadingEmployees || isLoadingServices || isLoadingAssignments || isLoadingExpenses || isLoadingEvents || isLoadingProfile;

  // Mutations
  const createEstate = useCreateEstateMutation();
  const updateEstate = useUpdateEstateMutation();
  const deleteEstate = useDeleteEstateMutation();
  const createSection = useCreateSectionMutation();
  const updateSection = useUpdateSectionMutation();
  const deleteSection = useDeleteSectionMutation();

  const createEmployee = useCreateEmployeeMutation();
  const updateEmployee = useUpdateEmployeeMutation();
  const deleteEmployee = useDeleteEmployeeMutation();

  const createService = useCreateServiceMutation();
  const updateService = useUpdateServiceMutation();
  const deleteService = useDeleteServiceMutation();

  const createAssignment = useCreateAssignmentMutation();
  const updateAssignment = useUpdateAssignmentMutation();
  const deleteAssignment = useDeleteAssignmentMutation();
  const updateAssignmentStatus = useUpdateAssignmentStatusMutation();
  const addWorker = useAddWorkerMutation();
  const updateWorker = useUpdateWorkerMutation();
  const removeWorker = useRemoveWorkerMutation();

  const createExpense = useCreateExpenseMutation();
  const updateExpense = useUpdateExpenseMutation();
  const deleteExpense = useDeleteExpenseMutation();

  const createEvent = useCreateEventMutation();
  const updateEvent = useUpdateEventMutation();
  const deleteEvent = useDeleteEventMutation();

  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const deleteUser = useDeleteUserMutation();

  const updateProfile = useUpdateProfileMutation();

  // Local state for UI components
  const [estates, setEstatesState] = useState<Estate[]>([]);
  const [users, setUsersState] = useState<User[]>([]);
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [services, setServicesState] = useState<Service[]>([]);
  const [assignments, setAssignmentsState] = useState<DailyAssignment[]>([]);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [events, setEventsState] = useState<CalendarEvent[]>([]);
  const [profile, setProfileState] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    memberSince: "",
  });

  // Sync server queries to local state
  useEffect(() => {
    if (serverEstates) setEstatesState(serverEstates as any);
  }, [serverEstates]);

  useEffect(() => {
    if (serverUsers) setUsersState(serverUsers as any);
  }, [serverUsers]);

  useEffect(() => {
    if (serverEmployees) setEmployeesState(serverEmployees as any);
  }, [serverEmployees]);

  useEffect(() => {
    if (serverServices) setServicesState(serverServices as any);
  }, [serverServices]);

  useEffect(() => {
    if (serverAssignments) setAssignmentsState(serverAssignments as any);
  }, [serverAssignments]);

  useEffect(() => {
    if (serverExpenses) setExpensesState(serverExpenses as any);
  }, [serverExpenses]);

  useEffect(() => {
    if (serverEvents) setEventsState(serverEvents as any);
  }, [serverEvents]);

  useEffect(() => {
    if (serverProfile) {
      setProfileState({
        name: serverProfile.name,
        email: serverProfile.email,
        phone: serverProfile.phone || "",
        address: serverProfile.address || "",
        role: serverProfile.role,
        memberSince: serverProfile.registeredDate ? new Date(serverProfile.registeredDate).toISOString().split("T")[0] : "",
      });
    }
  }, [serverProfile]);

  // Sync setters to mutations (Optimistic update style)
  const setEstates: React.Dispatch<React.SetStateAction<Estate[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(estates) : arg;
    const prev = estates;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) {
        createEstate.mutate(added);
      }
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) {
        deleteEstate.mutate(deleted.id);
      }
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (!pItem) return;
        if (JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          if (JSON.stringify(nItem.sections) !== JSON.stringify(pItem.sections)) {
            const pSecs = pItem.sections || [];
            const nSecs = nItem.sections || [];
            if (nSecs.length > pSecs.length) {
              const addedSec = nSecs.find((s) => !pSecs.some((ps) => ps.id === s.id));
              if (addedSec) {
                createSection.mutate({ estateId: nItem.id, payload: addedSec });
              }
            } else if (nSecs.length < pSecs.length) {
              const deletedSec = pSecs.find((s) => !nSecs.some((ns) => ns.id === s.id));
              if (deletedSec) {
                deleteSection.mutate({ estateId: nItem.id, sectionId: deletedSec.id });
              }
            } else {
              nSecs.forEach((nSec) => {
                const pSec = pSecs.find((ps) => ps.id === nSec.id);
                if (pSec && JSON.stringify(nSec) !== JSON.stringify(pSec)) {
                  updateSection.mutate({
                    estateId: nItem.id,
                    sectionId: nSec.id,
                    payload: nSec,
                  });
                }
              });
            }
          } else {
            updateEstate.mutate({ id: nItem.id, payload: nItem });
          }
        }
      });
    }
    setEstatesState(next);
  };

  const setUsers: React.Dispatch<React.SetStateAction<User[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(users) : arg;
    const prev = users;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) {
        createUser.mutate({
          ...added,
          password: "defaultPassword123",
        });
      }
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) {
        deleteUser.mutate(deleted.id);
      }
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (pItem && JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          updateUser.mutate({ id: nItem.id, payload: nItem });
        }
      });
    }
    setUsersState(next);
  };

  const setEmployees: React.Dispatch<React.SetStateAction<Employee[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(employees) : arg;
    const prev = employees;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) createEmployee.mutate(added);
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) deleteEmployee.mutate(deleted.id);
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (pItem && JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          updateEmployee.mutate({ id: nItem.id, payload: nItem });
        }
      });
    }
    setEmployeesState(next);
  };

  const setServices: React.Dispatch<React.SetStateAction<Service[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(services) : arg;
    const prev = services;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) createService.mutate(added);
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) deleteService.mutate(deleted.id);
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (pItem && JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          updateService.mutate({ id: nItem.id, payload: nItem });
        }
      });
    }
    setServicesState(next);
  };

  const setAssignments: React.Dispatch<React.SetStateAction<DailyAssignment[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(assignments) : arg;
    const prev = assignments;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) {
        createAssignment.mutate({
          date: added.date,
          estateId: added.estateId,
          sectionId: added.sectionId,
          serviceId: added.serviceId,
        });
      }
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) deleteAssignment.mutate(deleted.id);
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (!pItem) return;
        if (JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          if (nItem.status !== pItem.status) {
            updateAssignmentStatus.mutate({ id: nItem.id, status: nItem.status });
          }
          if (JSON.stringify(nItem.assignments) !== JSON.stringify(pItem.assignments)) {
            const pWorkers = pItem.assignments || [];
            const nWorkers = nItem.assignments || [];
            if (nWorkers.length > pWorkers.length) {
              const addedWorker = nWorkers.find((w) => !pWorkers.some((pw) => pw.employeeId === w.employeeId));
              if (addedWorker) {
                addWorker.mutate({
                  assignmentId: nItem.id,
                  payload: {
                    employeeId: addedWorker.employeeId,
                    unitsCompleted: addedWorker.unitsCompleted,
                  },
                });
              }
            } else if (nWorkers.length < pWorkers.length) {
              const deletedWorker = pWorkers.find((w) => !nWorkers.some((nw) => nw.employeeId === w.employeeId));
              if (deletedWorker) {
                removeWorker.mutate({
                  assignmentId: nItem.id,
                  employeeId: deletedWorker.employeeId,
                });
              }
            } else {
              nWorkers.forEach((nw) => {
                const pw = pWorkers.find((p) => p.employeeId === nw.employeeId);
                if (pw && JSON.stringify(nw) !== JSON.stringify(pw)) {
                  updateWorker.mutate({
                    assignmentId: nItem.id,
                    employeeId: nw.employeeId,
                    payload: {
                      unitsCompleted: nw.unitsCompleted,
                    },
                  });
                }
              });
            }
          } else {
            updateAssignment.mutate({ id: nItem.id, payload: nItem });
          }
        }
      });
    }
    setAssignmentsState(next);
  };

  const setExpenses: React.Dispatch<React.SetStateAction<Expense[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(expenses) : arg;
    const prev = expenses;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) createExpense.mutate(added);
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) deleteExpense.mutate(deleted.id);
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (pItem && JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          updateExpense.mutate({ id: nItem.id, payload: nItem });
        }
      });
    }
    setExpensesState(next);
  };

  const setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>> = (arg) => {
    const next = typeof arg === "function" ? arg(events) : arg;
    const prev = events;
    if (next.length > prev.length) {
      const added = next.find((item) => !prev.some((p) => p.id === item.id));
      if (added) createEvent.mutate(added);
    } else if (next.length < prev.length) {
      const deleted = prev.find((item) => !next.some((n) => n.id === item.id));
      if (deleted) deleteEvent.mutate(deleted.id);
    } else {
      next.forEach((nItem) => {
        const pItem = prev.find((p) => p.id === nItem.id);
        if (pItem && JSON.stringify(nItem) !== JSON.stringify(pItem)) {
          updateEvent.mutate({ id: nItem.id, payload: nItem });
        }
      });
    }
    setEventsState(next);
  };

  const setProfile: React.Dispatch<React.SetStateAction<UserProfile>> = (arg) => {
    const next = typeof arg === "function" ? arg(profile) : arg;
    const prev = profile;
    if (JSON.stringify(next) !== JSON.stringify(prev)) {
      updateProfile.mutate({
        name: next.name,
        email: next.email,
        phone: next.phone,
        address: next.address,
      });
    }
    setProfileState(next);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-[#00A63E] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[#6A7282] font-medium text-sm">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

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

