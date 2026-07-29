import { api } from "./api";

export const enableTwoFactor = async (
    userId: number,
    method: string
) => {

    const response = await api.post(
        "/2fa/enable",
        null,
        {
            params: {
                userId,
                method,
            },
        }
    );

    return response.data;

};
export interface VerifyOtpResponse {
  token: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
export const generateOtp = async (
  userId: number
): Promise<void> => {

  await api.post(
    "/2fa/generate",
    null,
    {
      params: {
        userId,
      },
    }
  );

};
export const verifyOtp = async (
  userId: number,
  code: string
): Promise<VerifyOtpResponse> => {

  const response = await api.post(
    "/2fa/verify",
    null,
    {
      params:{
        userId,
        code
      }
    }
  );

  return response.data;
};