"use client";

import { useDashboardContext } from "../context";
import ExpensesComponent from "@/components/Expenses";

export default function ExpensesPage() {
  const { expenses, setExpenses, estates } = useDashboardContext();

  return <ExpensesComponent expenses={expenses} setExpenses={setExpenses} estates={estates} />;
}
