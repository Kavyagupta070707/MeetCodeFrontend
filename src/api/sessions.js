import axiosInstance from "../lib/axios.js";


export const sessionApi= {
    createSession: async (data)=>{
        const response=await axiosInstance.post("/api/sessions", data);
        return response.data;    
    },

    getActiveSessions: async()=>{
        const response=await axiosInstance.get("/api/sessions/active");
        return response.data;
    },
    getRecentSessions: async()=>{
        const response=await axiosInstance.get("/api/sessions/past-sessions");
        return response.data;

    },
    getSessionbyId: async(id)=>{
        const response=await axiosInstance.get(`/api/sessions/${id}`);
        return response.data;

    },
    joinSession: async(id)=>{
        const response=await axiosInstance.post(`/api/sessions/${id}/join`);
        return response.data;

    },
    endSession: async(id)=>{
        const response=await axiosInstance.post(`/api/sessions/${id}/end`);
        return response.data;

    },
    getStreamToken: async()=>{
        const response=await axiosInstance.get("/api/chat/token");
        return response.data;

    },

}