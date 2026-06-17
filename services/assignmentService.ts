import { api } from "./api";

function mapAssignment(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(mapAssignment);
  }
  return {
    ...data,
    assignments: data.workers || data.assignments || [],
  };
}

export const assignmentService = {
  async list(params?: any) {
    const response = await api.get("/assignments", { params });
    return mapAssignment(response.data.data);
  },

  async get(id: string) {
    const response = await api.get(`/assignments/${id}`);
    return mapAssignment(response.data.data);
  },

  async create(payload: any) {
    const response = await api.post("/assignments", payload);
    return mapAssignment(response.data.data);
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/assignments/${id}`, payload);
    return mapAssignment(response.data.data);
  },

  async delete(id: string) {
    const response = await api.delete(`/assignments/${id}`);
    return mapAssignment(response.data.data);
  },

  async updateStatus(id: string, status: string) {
    const response = await api.patch(`/assignments/${id}/status`, { status });
    return mapAssignment(response.data.data);
  },

  async addWorker(id: string, payload: any) {
    const response = await api.post(`/assignments/${id}/workers`, payload);
    return mapAssignment(response.data.data);
  },

  async updateWorker(id: string, employeeId: string, payload: any) {
    const response = await api.put(`/assignments/${id}/workers/${employeeId}`, payload);
    return mapAssignment(response.data.data);
  },

  async removeWorker(id: string, employeeId: string) {
    const response = await api.delete(`/assignments/${id}/workers/${employeeId}`);
    return mapAssignment(response.data.data);
  },
};

