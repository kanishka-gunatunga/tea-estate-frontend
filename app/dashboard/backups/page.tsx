"use client";

import { useDashboardContext } from "../context";
import BackupsComponent from "@/components/Backups";

export default function BackupsPage() {
  const context = useDashboardContext();

  return (
    <BackupsComponent
      estates={context.estates}
      users={context.users}
      employees={context.employees}
      services={context.services}
      expenses={context.expenses}
      assignments={context.assignments}
    />
  );
}
