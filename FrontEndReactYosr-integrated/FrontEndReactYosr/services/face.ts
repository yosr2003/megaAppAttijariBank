import { api } from "./api";

export const registerFace = async (
  userId: number,
  photoUri: string
) => {

  const formData = new FormData();

  formData.append("userId", userId.toString());

  formData.append("image", {
    uri: photoUri,
    name: "face.jpg",
    type: "image/jpeg",
  } as any);

  const response = await api.post(
    "/faces/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const loginFace = async (
  photoUri: string
) => {

  const formData = new FormData();


  formData.append("image", {
    uri: photoUri,
    name: "face.jpg",
    type: "image/jpeg",
  } as any);



  const response = await api.post(
    "/faces/login",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );


  return response.data;
};