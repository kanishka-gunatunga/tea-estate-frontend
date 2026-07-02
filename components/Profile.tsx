import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";

import { useProfileQuery, useUpdateProfileMutation } from "@/hooks/hooks";

// --- Types ---
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  memberSince: string;
  profilePhoto?: string | null;
}

export default function Profile() {
  const { data: serverProfile } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();

  const profile = (serverProfile as UserProfile) || {
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "System Administrator",
    memberSince: "Jan 2026",
    profilePhoto: null,
  };

  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Modal edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editAddress, setEditAddress] = useState(profile.address);
  const [editError, setEditError] = useState("");

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      setEditError("Name and Email address are required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      setEditError("Please enter a valid email address.");
      return;
    }

    updateProfile.mutate({
      ...profile,
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
    });

    setIsEditModalOpen(false);
    setEditError("");
  };

  const openEditModal = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditAddress(profile.address);
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (currentPassword !== "admin123") {
      setPasswordError("Incorrect current password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // Success
    setPasswordSuccess("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      router.push("/");
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const updatedProfile = await authService.uploadProfilePhoto(file);
      updateProfile.mutate({
        ...profile,
        profilePhoto: updatedProfile.profilePhoto,
      });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F9FAFB]">
      {/* Scroll container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 select-none">
        
        {/* Banner Header */}
        <div className="shrink-0">
          <h1 className="text-[24px] font-medium text-[#101828] leading-[36px] font-sans">My Profile</h1>
          <p className="text-[14px] font-normal text-[#6A7282] leading-[20px] mt-0.5 font-sans">
            Manage your account details and password
          </p>
        </div>

        {/* Card 1: User Profile details card */}
        <div className="bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm overflow-hidden flex flex-col shrink-0">
          {/* Green banner */}
          <div className="w-full h-24 bg-gradient-to-r from-[#016630] to-[#009966]" />

          {/* Profile Header Row */}
          <div className="flex items-end justify-between px-6 -mt-10 pb-4 shrink-0">
            <div className="relative">
              {/* Avatar Box */}
              <div className="w-[80px] h-[80px] bg-gradient-to-br from-[#00C950] to-[#007A55] rounded-[16px] border-4 border-white shadow-md flex items-center justify-center text-white select-none overflow-hidden relative">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className={`w-full h-full object-cover ${isUploadingPhoto ? 'opacity-50' : ''}`} />
                ) : (
                  <svg className={`w-11 h-11 ${isUploadingPhoto ? 'opacity-50' : 'opacity-95'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {/* Camera Icon Overlay */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00A63E] border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-[#009966] transition-colors shadow-xs cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change Avatar"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>
            </div>

            <button
              onClick={openEditModal}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 rounded-[14px] text-sm font-medium text-[#4A5565] transition-all shadow-xs cursor-pointer h-[38px]"
            >
              <svg className="w-3.5 h-3.5 text-[#4A5565]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>

          {/* User Details Grid */}
          <div className="px-6 pb-6 pt-2 shrink-0">
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              {/* Full Name */}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#99A1AF] tracking-[0.3px] uppercase font-sans">Full Name</span>
                <span className="text-[14px] font-normal text-[#1E2939] mt-1.5 font-sans">{profile.name}</span>
              </div>
              {/* Email */}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#99A1AF] tracking-[0.3px] uppercase font-sans">Email Address</span>
                <span className="text-[14px] font-normal text-[#1E2939] mt-1.5 font-sans">{profile.email}</span>
              </div>
              {/* Phone */}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#99A1AF] tracking-[0.3px] uppercase font-sans">Phone</span>
                <span className="text-[14px] font-normal text-[#1E2939] mt-1.5 font-sans">{profile.phone || "—"}</span>
              </div>
              {/* Address */}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#99A1AF] tracking-[0.3px] uppercase font-sans">Address</span>
                <span className="text-[14px] font-normal text-[#1E2939] mt-1.5 font-sans">{profile.address || "—"}</span>
              </div>
              {/* Role */}
              <div className="flex flex-col items-start justify-start">
                <span className="text-[12px] font-bold text-[#99A1AF] tracking-[0.3px] uppercase font-sans">Role</span>
                <div className="bg-[#F3E8FF] rounded-full px-2.5 py-0.5 mt-1">
                  <span className="text-[12px] font-normal text-[#8200DB] font-sans">{profile.role}</span>
                </div>
              </div>
              {/* Member Since */}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#99A1AF] tracking-[0.3px] uppercase font-sans">Member Since</span>
                <span className="text-[14px] font-normal text-[#1E2939] mt-1.5 font-sans font-mono">{profile.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Change Password card */}
        <div className="bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm p-6 flex flex-col gap-5 shrink-0">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFF7ED] rounded-[14px] flex items-center justify-center text-[#FF6900] shrink-0 shadow-xs">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold text-[#1E2939] leading-tight font-sans">Change Password</h4>
              <p className="text-[12px] font-normal text-[#99A1AF] mt-0.5 font-sans">Use at least 8 characters</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            {passwordError && (
              <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center font-sans animate-pulse max-w-md">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center font-sans max-w-md">
                {passwordSuccess}
              </div>
            )}

            <div className="grid grid-cols-3 gap-5">
              {/* Current Password */}
              <div className="flex flex-col relative">
                <label className="text-[14px] font-medium text-[#4A5565] mb-1.5 font-sans">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-[42px] border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-[14px] pl-3 pr-10 text-sm outline-none transition-all placeholder-[rgba(10,10,10,0.5)] text-gray-800 font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer select-none focus:outline-none"
                  >
                    {showCurrent ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col relative">
                <label className="text-[14px] font-medium text-[#4A5565] mb-1.5 font-sans">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[42px] border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-[14px] pl-3 pr-10 text-sm outline-none transition-all placeholder-[rgba(10,10,10,0.5)] text-gray-800 font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer select-none focus:outline-none"
                  >
                    {showNew ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col relative">
                <label className="text-[14px] font-medium text-[#4A5565] mb-1.5 font-sans">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[42px] border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-[14px] pl-3 pr-10 text-sm outline-none transition-all placeholder-[rgba(10,10,10,0.5)] text-gray-800 font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer select-none focus:outline-none"
                  >
                    {showConfirm ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex pt-1 shrink-0">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-[14px] shadow-sm hover:shadow transition-colors cursor-pointer select-none"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Card 3: Sign Out card */}
        <div className="bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FEF2F2] rounded-[14px] flex items-center justify-center text-[#FB2C36] shrink-0 shadow-xs">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold text-[#1E2939] leading-tight font-sans">Sign Out</h4>
              <p className="text-[12px] font-normal text-[#99A1AF] mt-0.5 font-sans">You will be logged out of the system</p>
            </div>
          </div>
          <div>
            <button
              onClick={handleSignOut}
              className="h-[42px] px-5 border border-[#FFC9C9] rounded-[14px] text-[14px] font-medium text-[#E7000B] hover:bg-[#FEF2F2] transition-colors cursor-pointer select-none"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* --- Dialog Modal: Edit Profile Details --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 select-none">
              <h3 className="text-lg font-bold text-gray-900 font-sans">
                Edit Profile Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleEditProfileSubmit} className="p-6 flex flex-col gap-4">
              {editError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center font-sans animate-pulse">
                  {editError}
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all text-gray-800 font-sans"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all text-gray-800 font-sans"
                  required
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all text-gray-800 font-sans"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Colombo, Sri Lanka"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all text-gray-800 font-sans"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer font-sans"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
