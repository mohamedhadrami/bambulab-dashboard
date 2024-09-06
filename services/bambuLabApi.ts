// @/services/bambuLabApi.ts

import { jwtDecode } from "jwt-decode";

export const getDecodedToken = (authToken: string) => {
    if (authToken) {
        const decodedToken: any = jwtDecode(authToken);
        const username = decodedToken.username;
        return {decodedToken, username}
    } else {
        throw new Error("Failed to decode authentication token as jwt")
    }
}