export interface UserPayload {
  email: string;
  name: string;
  picture?: string;
}

export const ALLOWED_EMAIL = (
  process.env.ALLOWED_EMAIL?.trim() || "abc@gmail.com"
).toLowerCase();

// Decode Google JWT payload
export function decodeGoogleIdToken(token: string): {
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Gagal mendecode Google ID token:", error);
    return null;
  }
}

// Verify Google Token with Google OAuth tokeninfo endpoint if Google Client ID is configured
export async function verifyGoogleTokenWithApi(
  idToken: string
): Promise<{ email?: string; name?: string; picture?: string; email_verified?: boolean } | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!res.ok) {
      return null;
    }
    const info = (await res.json()) as any;
    return {
      email: info.email,
      name: info.name,
      picture: info.picture,
      email_verified: info.email_verified === "true" || info.email_verified === true,
    };
  } catch (error) {
    console.error("Gagal memverifikasi token dengan Google API:", error);
    return null;
  }
}
