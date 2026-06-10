import { useState } from "react";

export interface Service {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  rate: number;
  unitType: string;
}

interface ServiceManagementProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

export default function ServiceManagement({ services, setServices }: ServiceManagementProps) {
  // Search query filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form input states
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceStatus, setServiceStatus] = useState<"active" | "inactive">("active");
  const [serviceUnit, setServiceUnit] = useState("");
  const [serviceRate, setServiceRate] = useState<number | "">("");
  const [formError, setFormError] = useState("");

  // Filtered services list
  const filteredServices = services.filter((srv) => {
    return (
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Open Add/Edit Modal
  const openModal = (srv: Service | null = null) => {
    if (srv) {
      setEditingService(srv);
      setServiceName(srv.name);
      setServiceDesc(srv.description);
      setServiceStatus(srv.status);
      setServiceUnit(srv.unitType);
      setServiceRate(srv.rate);
    } else {
      setEditingService(null);
      setServiceName("");
      setServiceDesc("");
      setServiceStatus("active");
      setServiceUnit("");
      setServiceRate("");
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // Save Service handler (Create/Edit)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) {
      setFormError("Service Name is a required field.");
      return;
    }
    if (!serviceUnit || serviceUnit === "Select Unit") {
      setFormError("Please select a Unit Type.");
      return;
    }
    if (serviceRate === "" || Number(serviceRate) <= 0) {
      setFormError("Rate per Unit must be a positive number.");
      return;
    }

    const rateNum = Number(serviceRate);

    if (editingService) {
      // Edit mode
      setServices((prev) =>
        prev.map((srv) =>
          srv.id === editingService.id
            ? {
                ...srv,
                name: serviceName,
                description: serviceDesc,
                status: serviceStatus,
                unitType: serviceUnit,
                rate: rateNum,
              }
            : srv
        )
      );
    } else {
      // Add mode
      const newService: Service = {
        id: `service-${Date.now()}`,
        name: serviceName,
        description: serviceDesc,
        status: serviceStatus,
        unitType: serviceUnit,
        rate: rateNum,
      };
      setServices((prev) => [...prev, newService]);
    }

    setIsModalOpen(false);
  };

  // Delete Service handler
  const handleDeleteService = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the "${name}" service?`)) {
      setServices((prev) => prev.filter((srv) => srv.id !== id));
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Header Dashboard Banner */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E5E7EB] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">
            Service Management
          </h1>
          <p className="text-sm font-normal text-[#6A7282] mt-0.5">
            Define services and their payment rates
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-sm rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Service</span>
        </button>
      </header>

      {/* Filter Row Block */}
      <section className="px-8 py-4 bg-[#F9FAFB] border-b border-gray-100 flex items-center gap-4 shrink-0">
        {/* Search Input */}
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-white border border-[#E5E7EB] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-[14px] pl-10 pr-3.5 text-sm outline-none transition-all placeholder-black/30 text-gray-800"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </section>

      {/* Services Cards Workspace */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-4 max-w-7xl">
          {filteredServices.length > 0 ? (
            filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white border border-[#F3F4F6] rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 flex items-center justify-between hover:shadow-md transition-all duration-200"
              >
                {/* Left Side: Icon & Details */}
                <div className="flex items-center gap-3.5">
                  {/* Tag Icon Circle */}
                  <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-[14px] flex items-center justify-center shadow-xs">
                    <svg className="w-5 h-5 text-[#00A63E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.586 2.293a2 2 0 011.414.586l7.303 7.303a2 2 0 010 2.828l-5.656 5.656a2 2 0 01-2.828 0L2.515 11.36a2 2 0 01-.586-1.414V4a2 2 0 012-2h4.071z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.01" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#1E2939] leading-tight">
                        {srv.name}
                      </h3>
                      {srv.status === "active" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#008236] uppercase tracking-wide">
                          active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 uppercase tracking-wide">
                          inactive
                        </span>
                      )}
                    </div>
                    {srv.description && (
                      <p className="text-xs text-[#99A1AF] mt-0.5">
                        {srv.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Rate & Actions */}
                <div className="flex items-center gap-6">
                  {/* Rate info block */}
                  <div className="flex flex-col items-end">
                    <span className="text-[14px] font-semibold text-[#008236]">
                      LKR {srv.rate.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#99A1AF] mt-0.5 capitalize">
                      per {srv.unitType}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(srv)}
                      className="w-[26px] h-[26px] bg-[#F3F4F6] hover:bg-emerald-50 text-gray-400 hover:text-[#00A63E] rounded-lg border border-[#D1D5DC] flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id, srv.name)}
                      className="w-[26px] h-[26px] bg-[#F3F4F6] hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg border border-[#D1D5DC] flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="w-[20px] h-4 flex items-center justify-center text-gray-400 pl-1 select-none">
                      <svg className="w-4 h-4 text-[#99A1AF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-[#E5E7EB] rounded-2xl">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <span className="text-sm font-semibold text-gray-600 mt-2">No services found</span>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Create new services or adjust your search filter query above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- Dialog Modal: Add / Edit Service --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveService} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center">
                  {formError}
                </div>
              )}

              {/* Service Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leaf Plucking"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all placeholder-gray-400 text-gray-800"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Description"
                  rows={3}
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg p-3 text-sm outline-none transition-all placeholder-gray-400 resize-none text-gray-800"
                />
              </div>

              {/* Status & Unit Type Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={serviceStatus}
                    onChange={(e) => setServiceStatus(e.target.value as "active" | "inactive")}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Unit Type */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Unit Type
                  </label>
                  <select
                    value={serviceUnit}
                    onChange={(e) => setServiceUnit(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800"
                  >
                    <option value="">Select Unit</option>
                    <option value="Hours">Hours</option>
                    <option value="Acres">Acres</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              {/* Rate per Unit (LKR) */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Rate per Unit (LKR)
                </label>
                <input
                  type="number"
                  placeholder="50.00"
                  value={serviceRate}
                  onChange={(e) => setServiceRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all placeholder-gray-400 text-gray-800"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer"
                >
                  {editingService ? "Save Changes" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
