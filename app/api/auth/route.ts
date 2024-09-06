// @/app/api/auth

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDecodedToken } from '@/services/bambuLabApi';

const BASE_URL = "https://api.bambulab.com";
const endpoint = "/v1/user-service/user/login";

export async function POST(request: Request) {
    const { email, password, isRemember } = await request.json();
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account: email, password }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const data = await response.json();
        const token = data.accessToken;
        const cookieOptions = isRemember 
            ? { maxAge: 30 * 24 * 60 * 60 }
            : {};

        cookies().set('access_token', token, cookieOptions);
        cookies().set('auth', JSON.stringify(data), cookieOptions);
        const { decodedToken, username } = getDecodedToken(token)
        cookies().set('token', JSON.stringify(decodedToken), cookieOptions);
        cookies().set('username', username, cookieOptions);
        return NextResponse.json({ decodedToken });
    } catch (error) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
