import axiosInstance from "../lib/axios.js";

export const oneVOneApi = {
  matchSession: async (difficulty) => {
    const response = await axiosInstance.post("/api/one-v-one/match", { difficulty });
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/api/one-v-one/${id}`);
    return response.data;
  },

  submitWin: async (id) => {
    const response = await axiosInstance.post(`/api/one-v-one/${id}/submit-win`);
    return response.data;
  },
};
