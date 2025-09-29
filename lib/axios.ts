"use client";

import axios, { AxiosError } from "axios";

// Create Axios instance
const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
axiosApi.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (global error handling)
axiosApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific HTTP codes globally
      if (error.response.status === 401) {
        console.error("Unauthorized - maybe redirect to login");
        // Optional: redirect to login
      }
      if (error.response.status === 500) {
        console.error("Server error, try again later");
      }
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Axios setup error", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosApi;
