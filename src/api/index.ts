import request from "../utils/request";

// GET 请求
export const get = (url: string, params = {}) => {
  return request({
    url: url,
    method: "GET",
    params,
  });
};

// POST 请求
export const post = (url: string, data = {}) => {
  return request({
    url: url,
    method: "POST",
    data,
  });
};

// PUT 请求
export const put = (url: string, data = {}) => {
  return request({
    url: url,
    method: "PUT",
    data,
  });
};

// DELETE 请求
export const del = (url: string, data = {}) => {
  return request({
    url,
    method: "DELETE",
    data,
  });
};

// 上传文件
export const upload = (url: string, formData: any, onProgress: any = null) => {
  return request({
    url,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: onProgress,
  });
};
