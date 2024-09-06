// @/app/api/auth/logout

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const cookieStore = cookies();
    try {
        cookieStore.getAll().forEach((cookie) => {
            cookieStore.delete(cookie.name);
        });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
