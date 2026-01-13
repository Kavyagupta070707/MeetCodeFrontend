import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

// Add request interceptor to include Clerk auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get the Clerk session token
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
export default axiosInstance;