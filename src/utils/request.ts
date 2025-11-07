import axios from "axios";
const env = import.meta.env;
import { message } from "antd";
import { LocalStorageKeys } from "../stores/localstorage";

// 创建 axios 实例
const request = axios.create({
  baseURL: "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 定义认证相关的接口（这些接口的401错误不需要特殊处理）
const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/verify-signature",
  "/auth/nonce",
];

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem(LocalStorageKeys.RIVERBIT_TOKEN_KEY);
    // 仅在请求 URL 包含 '/v1/' 时添加 token,以避免给不需要认证的请求添加无用的头部
    const shouldAddToken = token && config.url && config.url.includes("/v1/");
    if (shouldAddToken && token) {
      config.headers.Authorization = token;
    }
    // 如果是上传文件，修改 Content-Type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 如果是v1返回的走以下
    if (
      (data.code === 0 || data.success) &&
      response.config.url?.includes("/api/v1/")
    ) {
      return data;
    } else if (
      response.config.url?.includes("/v4/") ||
      response.config.url?.includes("/cosmos/") ||
      response.config.url?.includes("/dydxprotocol/")
    ) {
      // 在v4、cosmos/ data中没有code与success,直接返回data
      return data;
    } else {
      message.error(data.message || "Request failed!");
      return Promise.reject(new Error(data.message || "Request failed!"));
    }
  },
  (error) => {
    // 对响应错误做点什么
    console.log("error-----", error);
    const { response, config } = error;
    const url = config?.url || "";

    // 检查是否为认证相关接口
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
      url.includes(endpoint)
    );

    if (response) {
      switch (response.status) {
        case 401:
          // 清除token
          localStorage.removeItem(LocalStorageKeys.RIVERBIT_TOKEN_KEY);

          if (isAuthEndpoint) {
            // 认证接口的401错误
            message.error(response.data?.message || "Authentication failed");
          } else {
            // 其他接口的401错误
            message.error("Session expired, please reconnect your wallet");
          }
          break;
        case 403:
          message.error(response.data?.message || "Access denied");
          break;
        case 404:
          message.error(response.data?.message || "Resource not found");
          break;
        case 408:
          message.error("Request timeout");
          break;
        case 500:
          message.error(response.data?.message || "Internal server error");
          break;
        case 502:
          message.error("Bad gateway");
          break;
        case 503:
          message.error("Service unavailable");
          break;
        case 504:
          message.error("Gateway timeout");
          break;
        default:
          message.error(
            response.data?.message || `Network error (${response.status})`
          );
      }
    } else {
      // 处理网络错误
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        message.error("Request timeout, please check your network connection");
      } else if (error.message === "Network Error") {
        message.error(
          "Network connection error, please check your network settings"
        );
      } else {
        message.error("Network error, please try again later");
      }
    }

    return Promise.reject(error);
  }
);

export default request;
