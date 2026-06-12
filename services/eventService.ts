import { api } from "./api";

export const eventService = {
  async list(params?: any) {
    const response = await api.get("/events", { params });
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/events", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/events/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/events/${id}`);
    return response.data.data;
  },
};
