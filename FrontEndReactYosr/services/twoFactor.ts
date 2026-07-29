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