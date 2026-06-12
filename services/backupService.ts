import { api } from "./api";

export const backupService = {
  async list() {
    const response = await api.get("/backups");
    return response.data.data;
  },

  async create(type: "Manual" | "Auto" = "Manual") {
    const response = await api.post("/backups", { type });
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/backups/${id}`);
    return response.data.data;
  },

  getDownloadUrl(id: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("tea-estate-token") : "";
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";
    // We can also download directly via token as a query parameter or standard axios download
    return `${API_URL}/backups/${id}/download?token=${token}`;
  },
};
