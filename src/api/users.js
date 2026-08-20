import axiosInstance from "../lib/axios.js";

export const userApi = {
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/api/users/me");
    return response.data;
  },
};
