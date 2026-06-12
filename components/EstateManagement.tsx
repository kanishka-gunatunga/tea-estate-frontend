import { useState, useEffect, useRef } from "react";

export interface Section {
  id: string;
  name: string;
  area?: number;
  description?: string;
}

export interface Estate {
  id: string;
  name: string;
  location: string;
  mapsLink: string;
  area?: number;
  establishedYear?: number;
  planter: string;
  supervisor: string;
  status: "active" | "inactive";
  sections: Section[];
}

interface EstateManagementProps {
  estates: Estate[];
  setEstates: React.Dispatch<React.SetStateAction<Estate[]>>;
}

export default function EstateManagement({ estates, setEstates }: EstateManagementProps) {
  const [activeEstateId, setActiveEstateId] = useState<string>(
    estates.length > 0 ? estates[0].id : ""
  );

  // Modals visibility
  const [isEstateModalOpen, setIsEstateModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  // Form edit states
  const [editingEstate, setEditingEstate] = useState<Estate | null>(null);
  const [editingSection, setEditingSection] = useState<{ section: Section; estateId: string } | null>(null);

  // Estate Form Input fields
  const [estateName, setEstateName] = useState("");
  const [estateLocation, setEstateLocation] = useState("");
  const [estateMapsLink, setEstateMapsLink] = useState("");
  const [estateArea, setEstateArea] = useState<number | "">("");
  const [estateEst, setEstateEst] = useState<number | "">("");
  const [estatePlanter, setEstatePlanter] = useState("Carter Bator");
  const [estateSupervisor, setEstateSupervisor] = useState("Carter Bator");
  const [estateStatus, setEstateStatus] = useState<"active" | "inactive">("active");
  const [estateFormError, setEstateFormError] = useState("");

  // Section Form Input fields
  const [sectionName, setSectionName] = useState("");
  const [sectionArea, setSectionArea] = useState<number | "">("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [sectionFormError, setSectionFormError] = useState("");

  // Ref to track the last saved/added estate so we can preserve active selection when server ID syncs
  const lastSavedEstateRef = useRef<{ name: string; location: string } | null>(null);

  // Active Selected Estate details
  const activeEstate = estates.find((e) => e.id === activeEstateId) || estates[0];

  // Sync activeEstateId if the active estate's ID changed (e.g. after optimistic server mutation)
  useEffect(() => {
    if (activeEstateId && !estates.some((e) => e.id === activeEstateId)) {
      if (lastSavedEstateRef.current) {
        const { name, location } = lastSavedEstateRef.current;
        const matched = estates.find((e) => e.name === name && e.location === location);
        if (matched) {
          setActiveEstateId(matched.id);
          lastSavedEstateRef.current = null; // Reset
          return;
        }
      }
      if (estates.length > 0) {
        setActiveEstateId(estates[0].id);
      }
    }
  }, [estates, activeEstateId]);

  // --- Handlers ---

  // Open Estate Form (Add / Edit)
  const openEstateModal = (estate: Estate | null = null) => {
    if (estate) {
      setEditingEstate(estate);
      setEstateName(estate.name);
      setEstateLocation(estate.location);
      setEstateMapsLink(estate.mapsLink);
      setEstateArea(estate.area ?? "");
      setEstateEst(estate.establishedYear ?? "");
      setEstatePlanter(estate.planter);
      setEstateSupervisor(estate.supervisor);
      setEstateStatus(estate.status);
    } else {
      setEditingEstate(null);
      setEstateName("");
      setEstateLocation("");
      setEstateMapsLink("");
      setEstateArea("");
      setEstateEst("");
      setEstatePlanter("Carter Bator");
      setEstateSupervisor("Carter Bator");
      setEstateStatus("active");
    }
    setEstateFormError("");
    setIsEstateModalOpen(true);
  };

  // Save Estate (Add or Edit)
  const handleSaveEstate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estateName || !estateLocation) {
      setEstateFormError("Estate Name and Location are required fields.");
      return;
    }

    // Parse numeric fields safely. Send undefined if empty or not positive/valid.
    const areaNum = (estateArea !== "" && Number(estateArea) > 0) ? Number(estateArea) : undefined;
    const estNum = (estateEst !== "" && Number(estateEst) >= 1800 && Number(estateEst) <= 2100) ? Number(estateEst) : undefined;

    // Save name and location for active selection syncing
    lastSavedEstateRef.current = { name: estateName, location: estateLocation };

    if (editingEstate) {
      // Edit
      setEstates((prev) =>
        prev.map((est) =>
          est.id === editingEstate.id
            ? {
                ...est,
                name: estateName,
                location: estateLocation,
                mapsLink: estateMapsLink || `https://maps.google.com/?q=${encodeURIComponent(estateLocation)}`,
                area: areaNum,
                establishedYear: estNum,
                planter: estatePlanter,
                supervisor: estateSupervisor,
                status: estateStatus,
              }
            : est
        )
      );
    } else {
      // Add
      const newEstate: Estate = {
        id: `estate-${Date.now()}`,
        name: estateName,
        location: estateLocation,
        mapsLink: estateMapsLink || `https://maps.google.com/?q=${encodeURIComponent(estateLocation)}`,
        area: areaNum,
        establishedYear: estNum,
        planter: estatePlanter,
        supervisor: estateSupervisor,
        status: estateStatus,
        sections: [],
      };
      setEstates((prev) => [...prev, newEstate]);
      setActiveEstateId(newEstate.id);
    }

    setIsEstateModalOpen(false);
  };

  // Delete Estate
  const handleDeleteEstate = (estateId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting card
    if (confirm("Are you sure you want to delete this estate?")) {
      const remaining = estates.filter((est) => est.id !== estateId);
      setEstates(remaining);
      if (activeEstateId === estateId && remaining.length > 0) {
        setActiveEstateId(remaining[0].id);
      }
    }
  };

  // Open Section Form (Add / Edit)
  const openSectionModal = (section: Section | null = null) => {
    if (section && activeEstate) {
      setEditingSection({ section, estateId: activeEstate.id });
      setSectionName(section.name);
      setSectionArea(section.area ?? "");
      setSectionDesc(section.description || "");
    } else {
      setEditingSection(null);
      setSectionName("");
      setSectionArea("");
      setSectionDesc("");
    }
    setSectionFormError("");
    setIsSectionModalOpen(true);
  };

  // Save Section (Add or Edit)
  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName) {
      setSectionFormError("Section Name is required.");
      return;
    }
    if (!activeEstate) return;

    // Parse area safely. Send undefined if empty or not positive/valid.
    const areaNum = (sectionArea !== "" && Number(sectionArea) > 0) ? Number(sectionArea) : undefined;

    if (editingSection) {
      // Edit
      setEstates((prev) =>
        prev.map((est) =>
          est.id === editingSection.estateId
            ? {
                ...est,
                sections: est.sections.map((sec) =>
                  sec.id === editingSection.section.id
                    ? { ...sec, name: sectionName, area: areaNum, description: sectionDesc }
                    : sec
                ),
              }
            : est
        )
      );
    } else {
      // Add
      const newSec: Section = {
        id: `sec-${Date.now()}`,
        name: sectionName,
        area: areaNum,
        description: sectionDesc,
      };
      setEstates((prev) =>
        prev.map((est) =>
          est.id === activeEstate.id
            ? { ...est, sections: [...est.sections, newSec] }
            : est
        )
      );
    }

    setIsSectionModalOpen(false);
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    if (confirm("Are you sure you want to delete this section?") && activeEstate) {
      setEstates((prev) =>
        prev.map((est) =>
          est.id === activeEstate.id
            ? { ...est, sections: est.sections.filter((sec) => sec.id !== sectionId) }
            : est
        )
      );
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F9FAFB] font-sans">
      {/* Header Dashboard Banner */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#F3F4F6] shrink-0 no-print">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">
            Estate Management
          </h1>
          <p className="text-sm font-normal text-[#6A7282] mt-0.5">
            Manage tea estates and their sections
          </p>
        </div>
        <button
          onClick={() => openEstateModal(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-sm rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Estate</span>
        </button>
      </header>

      {/* Dashboard Workpane */}
      <div className="flex-1 flex overflow-hidden p-6 gap-5 bg-[#F9FAFB] font-sans">
        {/* Left Panel: Estates List */}
        <section className="w-[488px] flex flex-col gap-4 overflow-y-auto shrink-0 pr-2 pb-4 no-print">
          <div className="text-xs font-normal text-[#6A7282] tracking-wider uppercase pl-1 select-none">
            Estates ({estates.length})
          </div>

          <div className="flex flex-col gap-4">
            {estates.map((est) => {
              const isActive = est.id === activeEstateId;
              return (
                <div
                  key={est.id}
                  onClick={() => setActiveEstateId(est.id)}
                  className={`relative p-4 bg-white rounded-2xl cursor-pointer select-none transition-all duration-300 shadow-sm ${
                    isActive
                      ? "border-2 border-[#00A63E]"
                      : "border-2 border-[#F3F4F6] hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      {/* Title block */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            est.status === "active"
                              ? "bg-[#00C950]"
                              : "bg-[#D1D5DC]"
                          }`}
                        />
                        <h3 className="text-base font-medium text-[#1E2939] leading-tight">
                          {est.name}
                        </h3>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-[#6A7282]">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{est.location}</span>
                        {est.mapsLink && (
                          <a
                            href={est.mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} // Stop selection
                            className="inline-flex text-[#2B7FFF] hover:underline ml-1"
                            title="Open Google Maps"
                          >
                            <svg className="w-3 h-3 text-[#2B7FFF]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>

                      {/* Quick Specs */}
                      <div className="flex items-center gap-1.5 text-xs text-[#99A1AF] mt-1">
                        <span>{est.area ? `${est.area} ha` : "— ha"}</span>
                        <span>·</span>
                        <span>{est.sections.length} sections</span>
                        <span>·</span>
                        <span>{est.establishedYear ? `Est. ${est.establishedYear}` : "Est. —"}</span>
                      </div>

                      {/* Planter */}
                      <div className="text-xs text-[#00A63E] font-normal mt-1 leading-tight">
                        Planter: {est.planter}
                      </div>
                    </div>

                    {/* CRUD Actions + Chevron on Card */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEstateModal(est);
                        }}
                        className="w-6 h-6 bg-transparent hover:bg-emerald-50 rounded-lg flex items-center justify-center text-[#D1D5DC] hover:text-[#00A63E] transition-colors cursor-pointer border-none"
                        title="Edit Estate"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteEstate(est.id, e)}
                        className="w-6 h-6 bg-transparent hover:bg-red-50 rounded-lg flex items-center justify-center text-[#D1D5DC] hover:text-red-500 transition-colors cursor-pointer border-none"
                        title="Delete Estate"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      {/* Chevron Right > */}
                      <svg className="w-4 h-4 text-[#D1D5DC] select-none ml-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Panel: Selected Estate Details */}
        {activeEstate ? (
          <section className="flex-1 flex flex-col overflow-hidden bg-white border border-[#F3F4F6] rounded-2xl shadow-sm print-full-width">
            {/* Card Header (Gradient background band) */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] border-b border-[#F3F4F6] shrink-0">
              <div>
                <h2 className="text-lg font-medium text-[#1E2939] leading-tight">
                  {activeEstate.name}
                </h2>
                <p className="text-xs font-normal text-[#6A7282] mt-0.5">
                  {activeEstate.sections.length} sections · {activeEstate.area ? `${activeEstate.area} hectares total` : "— hectares total"}
                </p>
              </div>
              <button
                onClick={() => openSectionModal(null)}
                className="flex items-center justify-center gap-1.5 w-[130px] h-[36px] bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-sm rounded-[14px] shadow-sm hover:shadow cursor-pointer transition-all active:scale-95 border-none no-print"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Section</span>
              </button>
            </div>

            {/* Scrollable details content container */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              {/* Sections list grid */}
              <div>
                {activeEstate.sections.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {activeEstate.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-[#F0FDF4] border border-[#B9F8CF] rounded-[14px] p-4 min-h-[92px] h-auto flex flex-col justify-between transition-all hover:shadow-2xs"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-medium text-sm text-[#00A63E] truncate">
                              {sec.name}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0 no-print">
                              <button
                                onClick={() => openSectionModal(sec)}
                                className="w-6 h-6 bg-transparent hover:bg-emerald-50 rounded-md flex items-center justify-center text-[#D1D5DC] hover:text-[#00A63E] transition-colors border-none cursor-pointer"
                                title="Edit Section"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSection(sec.id)}
                                className="w-6 h-6 bg-transparent hover:bg-red-50 rounded-md flex items-center justify-center text-[#D1D5DC] hover:text-red-500 transition-colors border-none cursor-pointer"
                                title="Delete Section"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-xs font-normal text-[#6A7282] mt-0.5">
                            {sec.area ? `${sec.area} hectares` : "— hectares"}
                          </div>
                        </div>
                        {sec.description && (
                          <p className="text-xs text-[#99A1AF] mt-1 line-clamp-1 leading-relaxed truncate">
                            {sec.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-[#E5E7EB] rounded-xl text-center p-6 bg-[#F9FAFB]">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600 mt-2">No sections defined</span>
                    <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                      Add sections to parcel and manage this tea estate area.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom detail summary metadata */}
              <div className="border-t border-[#F3F4F6] pt-5">
                <h4 className="text-xs font-semibold text-[#99A1AF] uppercase tracking-[0.3px] mb-3.5 select-none">
                  Estate Details
                </h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-8">
                  <div className="flex items-center gap-2 text-sm text-[#6A7282]">
                    <span className="font-normal">Established:</span>
                    <span className="font-medium text-[#1E2939]">{activeEstate.establishedYear || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6A7282]">
                    <span className="font-normal">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] capitalize border border-[#B9F8CF]">
                      {activeEstate.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6A7282]">
                    <span className="font-normal">Planter:</span>
                    <span className="font-medium text-[#1E2939]">{activeEstate.planter}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6A7282]">
                    <span className="font-normal">Supervisor:</span>
                    <span className="font-medium text-[#1E2939]">{activeEstate.supervisor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6A7282] col-span-2">
                    <span className="font-normal">Google Maps:</span>
                    {activeEstate.mapsLink && (
                      <a
                        href={activeEstate.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#2B7FFF] hover:underline flex items-center gap-1 transition-colors cursor-pointer w-fit"
                      >
                        <span>Open in Maps</span>
                        <svg className="w-3.5 h-3.5 text-[#2B7FFF]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-[#E5E7EB] bg-white rounded-2xl p-6 text-center">
            <p className="text-gray-400">Select or add an estate to view details.</p>
          </div>
        )}
      </div>

      {/* --- Dialog Modal: Add / Edit Estate --- */}
      {isEstateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingEstate ? "Edit Estate" : "Add New Estate"}
              </h3>
              <button
                onClick={() => setIsEstateModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEstate} className="p-6 flex flex-col gap-4">
              {estateFormError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                  {estateFormError}
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Estate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Greenleaf Tea Estate"
                  value={estateName}
                  onChange={(e) => setEstateName(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>

              {/* Location */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nuwara Eliya, Sri Lanka"
                  value={estateLocation}
                  onChange={(e) => setEstateLocation(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>

              {/* Google Maps Link */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Google Maps Link
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={estateMapsLink}
                  onChange={(e) => setEstateMapsLink(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                />
                <span className="text-[10px] text-gray-400 mt-1 pl-1">
                  Paste a Google Maps share link
                </span>
              </div>

              {/* Grid Area & Est */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Total Area (ha)
                  </label>
                  <input
                    type="number"
                    placeholder="450"
                    value={estateArea}
                    onChange={(e) => setEstateArea(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Established
                  </label>
                  <input
                    type="number"
                    placeholder="2005"
                    value={estateEst}
                    onChange={(e) => setEstateEst(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Grid Planter & Supervisor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Planter (Owner)
                  </label>
                  <select
                    value={estatePlanter}
                    onChange={(e) => setEstatePlanter(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm text-black outline-none transition-all cursor-pointer"
                  >
                    <option value="Carter Bator">Carter Bator</option>
                    <option value="Alistair Finch">Alistair Finch</option>
                    <option value="Saman Silva">Saman Silva</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Supervisor
                  </label>
                  <select
                    value={estateSupervisor}
                    onChange={(e) => setEstateSupervisor(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm text-black outline-none transition-all cursor-pointer"
                  >
                    <option value="Carter Bator">Carter Bator</option>
                    <option value="Kasun Perera">Kasun Perera</option>
                    <option value="Nimal Bandara">Nimal Bandara</option>
                  </select>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={estateStatus}
                  onChange={(e) => setEstateStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm text-black outline-none transition-all cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEstateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer"
                >
                  {editingEstate ? "Save Changes" : "Add Estate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Dialog Modal: Add / Edit Section --- */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingSection ? "Edit Section" : "Add Section"}
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveSection} className="p-6 flex flex-col gap-4">
              {sectionFormError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                  {sectionFormError}
                </div>
              )}

              {/* Info Banner */}
              {activeEstate && (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Adding to: <strong className="font-semibold">{activeEstate.name}</strong>
                  </span>
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plantation A"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>

              {/* Area */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Area (hectares)
                </label>
                <input
                  type="number"
                  placeholder="80"
                  value={sectionArea}
                  onChange={(e) => setSectionArea(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm text-black outline-none transition-all placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of this section"
                  rows={3}
                  value={sectionDesc}
                  onChange={(e) => setSectionDesc(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg p-3 text-sm text-black outline-none transition-all placeholder-gray-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer"
                >
                  {editingSection ? "Save Changes" : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
