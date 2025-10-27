import axios from "axios";
import PrivateApi from "./PrivateApi";
import PublicApi from "./PublicApi";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true,
});

const privateApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

privateApi.interceptors.request.use(
  (config) => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error retrieving accessToken from sessionStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🧩 Trường hợp token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokenResponse = await PublicApi.getNewToken();
        const newAccessToken = tokenResponse.data.accessToken;

        sessionStorage.setItem("accessToken", newAccessToken);

        // Cập nhật lại header Authorization
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        // Gửi lại request gốc
        return privateApi(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token hết hạn hoặc invalid
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        // window.location.href = "/login";
        console.error("Refresh token error:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    // 🧩 Các lỗi khác từ backend
    if (error.response) {
      const { data } = error.response;
      const errorMessage =
        data?.message || data?.error || "An unknown error occurred.";

      console.error("API Error Response:", data);

      // Gán message để hiện ở UI
      error.message = errorMessage;

      return Promise.reject(error);
    }

    // 🧩 Lỗi network
    if (error.code === "ERR_NETWORK") {
      error.message = "Network error or server is unreachable.";
    }

    return Promise.reject(error);
  }
);

export const apiConfig = { publicApi, privateApi };
