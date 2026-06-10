"use client";

import { useDashboardContext } from "../context";
import ServiceManagement from "@/components/ServiceManagement";

export default function ServicesPage() {
  const { services, setServices } = useDashboardContext();

  return <ServiceManagement services={services} setServices={setServices} />;
}
