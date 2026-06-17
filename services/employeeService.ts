import { api } from "./api";

export const employeeService = {
  async list(params?: any) {
    const response = await api.get("/employees", { params });
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/employees", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/employees/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/employees/${id}`);
    return response.data.data;
  },
};
