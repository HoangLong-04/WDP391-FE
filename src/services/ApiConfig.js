import axios from "axios";
import PrivateApi from "./PrivateApi";
import PublicApi from "./PublicApi";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const privateApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

privateApi.interceptors.request.use(
  (config) => {
    try {
      const rawUser = sessionStorage.getItem("user");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user?.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage =
        error.response.data.message || "An unknown error occurred.";
      error.message = errorMessage;

      console.error("API Error Response:", error.response.data);

      return Promise.reject(error);
    }

    if (error.code === "ERR_NETWORK") {
      error.message = "Network error or server is unreachable.";
    }

    return Promise.reject(error);
  }
);

privateApi.interceptors.response.use(
  (response) => response, //Nếu thành công thì trả response luôn
  async (error) => {
    const originalRequest = error.config;

    //Nếu không có response hoặc không phải lỗi 401 thì reject luôn
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    //Tránh lặp vô hạn nếu refresh token cũng bị 401
    if (originalRequest._retry) {
      sessionStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      //Gọi API refresh token
      const res = await PublicApi.getNewToken();
      const newAccessToken = res.data?.accessToken;

      if (!newAccessToken) {
        throw new Error("Không có accessToken mới");
      }

      //Cập nhật token vào localStorage
      localStorage.setItem("accessToken", newAccessToken);

      //Gắn lại Authorization header cho request cũ
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      //Retry request gốc
      return privateApi(originalRequest);
    } catch (err) {
      console.error("Làm mới token thất bại:", err);

      //Nếu refresh thất bại → logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";

      return Promise.reject(err);
    }
  }
);

export const apiConfig = { publicApi, privateApi };
