"use client";

import { useDashboardContext } from "../context";
import EmployeeManagement from "@/components/EmployeeManagement";

export default function EmployeesPage() {
  const { employees, setEmployees, estates, services } = useDashboardContext();

  return (
    <EmployeeManagement
      employees={employees}
      setEmployees={setEmployees}
      estates={estates}
      services={services}
    />
  );
}
