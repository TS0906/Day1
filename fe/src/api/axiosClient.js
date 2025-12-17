import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const url = err.config?.url || "";
    const path = window.location.pathname;

    let message = "Something went wrong";

    if (!err.response) {
      message = "Cannot connect to server";
    } else if (typeof data?.error === "string") {
      message = data.error;
    } else if (typeof data?.message === "string") {
      message = data.message;
    } else if (Array.isArray(data?.errors)) {
      message = data.errors.join(", ");
    } else if (data?.errors && typeof data.errors === "object") {
      message = Object.values(data.errors).join(", ");
    }

    err.normalizedMessage = message;

    if (
      status === 401 &&
      !url.includes("/auth/me") &&
      path !== "/login" &&
      path !== "/register"
    ) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default axiosClient;