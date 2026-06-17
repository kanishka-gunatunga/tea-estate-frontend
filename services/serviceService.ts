import { api } from "./api";

export const serviceService = {
  async list(params?: any) {
    const response = await api.get("/services", { params });
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/services/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/services", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/services/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/services/${id}`);
    return response.data.data;
  },
};
