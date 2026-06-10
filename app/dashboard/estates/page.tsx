"use client";

import { useDashboardContext } from "../context";
import EstateManagement from "@/components/EstateManagement";

export default function EstatesPage() {
  const { estates, setEstates } = useDashboardContext();

  return <EstateManagement estates={estates} setEstates={setEstates} />;
}
