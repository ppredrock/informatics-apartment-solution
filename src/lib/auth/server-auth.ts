import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "./config";

export async function getServerUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return {
    uid: tokens.decodedToken.uid,
    email: tokens.decodedToken.email,
    name: tokens.decodedToken.name,
    picture: tokens.decodedToken.picture,
  };
}
