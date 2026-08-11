export interface GeoLocalizationResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  address: string;
}

const GEOCLIP_API_URL = "http://172.20.10.13:5001";


export const localizeImage = async (
  imageUri: string,
  fileName?: string,
  mimeType?: string
): Promise<GeoLocalizationResult> => {
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: fileName || "image.jpg",
    type: mimeType || "image/jpeg",
  } as any);

  const response = await fetch(
    `${GEOCLIP_API_URL}/localize`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Erreur lors de la géolocalisation"
    );
  }

  return data;
};