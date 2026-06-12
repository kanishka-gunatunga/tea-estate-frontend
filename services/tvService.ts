import { api } from "./api";

export const tvService = {
  async getTvDashboard(estateId?: string) {
    const response = await api.get("/tv/dashboard", {
      params: estateId ? { estateId } : undefined,
    });
    return response.data.data;
  },
};
