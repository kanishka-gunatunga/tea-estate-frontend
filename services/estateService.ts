import { api } from "./api";

export const estateService = {
  async list() {
    const response = await api.get("/estates");
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get(`/estates/${id}`);
    return response.data.data;
  },

  async create(payload: any) {
    const response = await api.post("/estates", payload);
    return response.data.data;
  },

  async update(id: string, payload: any) {
    const response = await api.put(`/estates/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/estates/${id}`);
    return response.data.data;
  },

  async createSection(estateId: string, payload: any) {
    const response = await api.post(`/estates/${estateId}/sections`, payload);
    return response.data.data;
  },

  async updateSection(estateId: string, sectionId: string, payload: any) {
    const response = await api.put(`/estates/${estateId}/sections/${sectionId}`, payload);
    return response.data.data;
  },

  async deleteSection(estateId: string, sectionId: string) {
    const response = await api.delete(`/estates/${estateId}/sections/${sectionId}`);
    return response.data.data;
  },
};
