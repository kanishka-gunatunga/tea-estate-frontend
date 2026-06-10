"use client";

import { useDashboardContext } from "../context";
import RemindersComponent from "@/components/Reminders";

export default function RemindersPage() {
  const { events, setEvents, estates } = useDashboardContext();

  return <RemindersComponent events={events} setEvents={setEvents} estates={estates} />;
}
