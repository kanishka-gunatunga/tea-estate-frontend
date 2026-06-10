"use client";

import { useDashboardContext } from "../context";
import DailyAssignmentComponent from "@/components/DailyAssignment";

export default function AssignmentsPage() {
  const { assignments, setAssignments, estates, employees, services } = useDashboardContext();

  return (
    <DailyAssignmentComponent
      assignments={assignments}
      setAssignments={setAssignments}
      estates={estates}
      employees={employees}
      services={services}
    />
  );
}
