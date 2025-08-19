import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8080",
  withCredentials: false,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    // Don't add Authorization header for login and bootstrap endpoints
    if (token && !config.url?.includes('/api/auth/login') && !config.url?.includes('/api/auth/bootstrap-admin')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: basic response/error logging during dev
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // surface server-side messages consistently
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export default api;

