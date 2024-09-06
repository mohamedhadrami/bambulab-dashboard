// @/app/api/bambulab/tasks

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Gets list of tasks bound to account
 * @todo check optional query parameters and what type actually is and what its code means
 * @endpoint /v1/user-service/my/tasks
 * @queryParam devideId
 * @queryParam after
 * @queryParam limit
 * @returns Returns list of tasks
 */
export async function GET(request: NextRequest) {
    const queryParams = request.nextUrl.searchParams.toString();

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/user-service/my/tasks?${queryParams}`;

    try {
        const accessToken = cookies().get('access_token')

        if (!accessToken) {
            return NextResponse.json({ error: 'Please login' }, { status: 401 });
        }

        const res = await fetch(BASE_URL + endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken.value}`,
                'Content-Type': 'application/json',
            }
        })

        if (!res.ok) {
            return NextResponse.json({ status: res.status, error: `Couldn't fetch data` });
        }

        const data = await res.json();

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({ error: 'There\'s been some problem.' }, { status: 500 });
    }
}
