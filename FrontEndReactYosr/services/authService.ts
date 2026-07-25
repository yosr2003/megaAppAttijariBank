import { api } from "./api";
import { LoginRequest, LoginResponse } from "../types/auth";

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {

  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const signup = async (
  formData: FormData
) => {

  const response = await api.post(
    "/auth/signup",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
