import { api } from "./api";

export const authService = {
  async login(payload: any) {
    const response = await api.post("/auth/login", payload);
    return response.data.data; // Expected keys: user, token
  },

  async logout() {
    const response = await api.post("/auth/logout");
    return response.data.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  async updateProfile(payload: any) {
    const response = await api.patch("/auth/profile", payload);
    return response.data.data;
  },

  async changePassword(payload: any) {
    const response = await api.post("/auth/change-password", payload);
    return response.data.data;
  },
};
