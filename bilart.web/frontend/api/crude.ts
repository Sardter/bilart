import axios from "axios";
import type {ApiReuslt} from "./api_types";

export const AuthError = class extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const getEncodedCredentials = (): string => {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  if (!username || !password) {
    throw new AuthError("Credentials not found in local storage");
  }
  return Buffer.from(`${username}:${password}`).toString("base64");
};

export const setCredentials = (username: string, password: string): void => {
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
};

export const cleanCredentials = (): void => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
};

// Generic GET function
export const get = async <T>(url: string): Promise<ApiReuslt<T>> => {
    const credentials = getEncodedCredentials();
    const response = await axios.get<ApiReuslt<T>>(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    return response.data;
};

// Generic POST function
export const post = async <T, U>(
  url: string,
  data: T
): Promise<ApiReuslt<U>> => {
  const response = await axios.post<ApiReuslt<U>>(url, data, {
    headers: {
      Authorization: `Basic ${getEncodedCredentials()}`,
    },
  });
  return response.data;
};

export const publicPost = async<T, U>(
  url: string,
  data: T
): Promise<ApiReuslt<U>> => {
  const response = await axios.post<ApiReuslt<U>>(url, data);
  return response.data;

}

export const postFormData = async <T>(
  url: string,
  data: FormData
): Promise<ApiReuslt<T>> => {
  const response = await axios.post<ApiReuslt<T>>(url, data, {
    headers: {
      Authorization: `Basic ${getEncodedCredentials()}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Generic PUT function
export const put = async <T, U>(
  url: string,
  data: T
): Promise<ApiReuslt<U>> => {
  const response = await axios.put<ApiReuslt<U>>(url, data, {
    headers: {
      Authorization: `Basic ${getEncodedCredentials()}`,
    },
  });
  return response.data;
};

// Generic DELETE function
export const deleteItem = async <T>(
  url: string,
  data: T
): Promise<ApiReuslt<T>> => {
  const response = await axios.delete<ApiReuslt<T>>(url, {
    headers: {
      Authorization: `Basic ${getEncodedCredentials()}`,
    },
    data: data
  }); 
  return response.data;
};

export const toQueryString = (params: Record<string, any>): string => {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
};
