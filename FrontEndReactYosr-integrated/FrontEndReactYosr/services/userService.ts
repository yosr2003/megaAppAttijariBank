import { api } from "./api";
import { getToken } from "../utils/storage";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  role?: string | null;
  userType?: string | null;
}

export const getAllUsers = async (): Promise<User[]> => {
  const token = await getToken();

  const response = await api.get("/auth", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

