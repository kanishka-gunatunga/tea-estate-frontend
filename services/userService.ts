import { api } from "./api";

export const userService = {
  async list(params?: any) {
    const response = await api.get("/users", { params });
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/users", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/users/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data.data;
  },
};
