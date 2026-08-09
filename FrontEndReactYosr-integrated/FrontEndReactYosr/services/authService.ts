import { api } from "./api";
import { LoginRequest, LoginResponse } from "../types/auth";
import { getToken } from "../utils/storage";
export const login = async (
 credentials:any
):Promise<LoginResponse> => {

 const response = await api.post(
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




export const getProfileImageUrl = async (
  filename: string | null | undefined
) => {
  if (!filename) {
    return null;
  }

  const token = await getToken();

  return {
    uri: api.getUri({
      url: `/auth/profile-image/${filename}`,
    }),
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  };
};

