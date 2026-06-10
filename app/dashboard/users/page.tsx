"use client";

import { useDashboardContext } from "../context";
import UserManagement from "@/components/UserManagement";

export default function UsersPage() {
  const { users, setUsers, estates } = useDashboardContext();

  return <UserManagement users={users} setUsers={setUsers} estates={estates} />;
}
