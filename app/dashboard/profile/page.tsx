"use client";

import { useDashboardContext } from "../context";
import ProfileComponent from "@/components/Profile";

export default function ProfilePage() {
  const { profile, setProfile } = useDashboardContext();

  return <ProfileComponent profile={profile} setProfile={setProfile} />;
}
