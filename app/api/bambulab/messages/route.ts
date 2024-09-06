// @/app/api/bambulab/messages

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Gets task message history, looks like, for the past 2 weeks
 * @todo check optional query parameters and what type actually is and what its code means
 * @endpoint /v1/user-service/my/messages
 * @queryParam type 
 * @queryParam after - will return all messages after a particular message, given an id
 * @queryParam limit - default is 20, max is 64
 * @returns Returns list of messages
 */
export async function GET(request: NextRequest) {
    const queryParams = request.nextUrl.searchParams.toString();

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/user-service/my/messages?${queryParams}`;

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
