// @/app/api/bambulab/task-details

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
    let searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const profileId = searchParams.get('profile_id');
    const modelId = searchParams.get('model_id');

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/iot-service/api/user/profile/${profileId}?model_id=${modelId}`;

    try {
        const accessToken = cookies().get('access_token')

        if (!accessToken) return NextResponse.json({ status: 401, error: 'Please login' });
        if (!profileId) return NextResponse.json({ status: 422, error: `Please specify a profile ID` });
        if (!modelId) return NextResponse.json({ status: 422, error: `Please specify a model ID` });

        const res = await fetch(BASE_URL + endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken.value}`,
                'Content-Type': 'application/json',
            }
        })

        if (!res.ok) return NextResponse.json({ status: res.status, error: `Couldn't fetch data` });

        const data = await res.json();

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({ error: 'There\'s been some problem.' }, { status: 500 });
    }
}
