export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {

  // Cas normal sans 2FA
  token?: string;
  type?: string;
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  profileImage: string | null;


  // Cas 2FA activé
  status?: "OTP_REQUIRED" | "SUCCESS";
  userId?: number;
  method?: "EMAIL" | "SMS" | "AUTHENTICATOR";

}