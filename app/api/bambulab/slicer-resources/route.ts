// @/app/api/bambulab/slicer-resources

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Gets list resources for slicer and any available upgrades for slicer
 * @todo Check optional query param, i have no resources
 * @endpoint /v1/iot-service/api/slicer/resource
 * @queryParam type
 * @returns list of resource plugins
 */
export async function GET(request: NextRequest) {
    const queryParams = request.nextUrl.searchParams.toString();

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/iot-service/api/slicer/resource?${queryParams}`;

    try {
        const accessToken = cookies().get('access_token')

        if (!accessToken) {
            return NextResponse.json({ status: 401, error: 'Please login' });
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
        return NextResponse.json({ status: 500, error: 'There\'s been some problem.' });
    }
}
