import { api } from "./api";

export const dashboardService = {
  async getKpis() {
    const response = await api.get("/dashboard/kpis");
    return response.data.data;
  },

  async getExpenseBreakdown() {
    const response = await api.get("/dashboard/expense-breakdown");
    return response.data.data;
  },

  async getMonthlyTrends() {
    const response = await api.get("/dashboard/monthly-trends");
    return response.data.data;
  },

  async getSectionHarvest() {
    const response = await api.get("/dashboard/section-harvest");
    return response.data.data;
  },

  async getUpcomingEvents() {
    const response = await api.get("/dashboard/upcoming-events");
    return response.data.data;
  },
};
