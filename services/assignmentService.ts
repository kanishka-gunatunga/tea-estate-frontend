import { api } from "./api";

export const assignmentService = {
  async list(params?: any) {
    const response = await api.get("/assignments", { params });
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/assignments/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/assignments", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/assignments/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/assignments/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: string) {
    const response = await api.patch(`/assignments/${id}/status`, { status });
    return response.data.data;
  },

  async addWorker(id: string, payload: any) {
    const response = await api.post(`/assignments/${id}/workers`, payload);
    return response.data.data;
  },

  async updateWorker(id: string, employeeId: string, payload: any) {
    const response = await api.put(`/assignments/${id}/workers/${employeeId}`, payload);
    return response.data.data;
  },

  async removeWorker(id: string, employeeId: string) {
    const response = await api.delete(`/assignments/${id}/workers/${employeeId}`);
    return response.data.data;
  },
};
