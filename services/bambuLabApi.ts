// @/services/bambuLabApi.ts
import { jwtDecode } from "jwt-decode";

type Decoded = {
  exp?: number;
  username?: string;
  [k: string]: unknown;
};

export const getDecodedToken = (authToken: string) => {
  if (!authToken) throw new Error("Missing auth token");

  // If it doesn't look like a JWT, don't try to decode it
  const isJwt = authToken.split(".").length === 3;
  if (!isJwt) {
    return { decodedToken: null, username: "" };
  }

  const decodedToken = jwtDecode<Decoded>(authToken);
  const username = typeof decodedToken.username === "string" ? decodedToken.username : "";
  return { decodedToken, username };
};
