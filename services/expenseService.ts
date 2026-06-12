import { api } from "./api";

export const expenseService = {
  async list(params?: any) {
    const response = await api.get("/expenses", { params });
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/expenses", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/expenses/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data.data;
  },
};
