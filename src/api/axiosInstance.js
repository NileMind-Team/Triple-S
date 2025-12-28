import axios from "axios";
import apiConfig from "./apiConfig";

const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers.Tenant = "Triples";

  return config;
});

export default axiosInstance;
