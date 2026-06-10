"use client";

import { useDashboardContext } from "../context";
import ReportsComponent from "@/components/Reports";

export default function ReportsPage() {
  const { estates, employees, services, assignments, expenses } = useDashboardContext();

  return (
    <ReportsComponent
      estates={estates}
      employees={employees}
      services={services}
      assignments={assignments}
      expenses={expenses}
    />
  );
}
