// @/app/api/bambulab/current-version

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Provides current firmware version and updates
 * @param {string} DEVICE_ID the id of the device you want to query
 * @endpoint /v1/iot-service/api/user/device/version?dev_id=${DEVICE_ID}
 * @returns Printer firmware version and updates
 */
export async function GET(request: NextRequest) {
    let searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const devId = searchParams.get('dev_id');

    const queryParams = request.nextUrl.searchParams.toString();

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/iot-service/api/user/device/version?${queryParams}`;

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

        const data = await res.json();

        if (!res.ok) {
            if (!devId) {
                return NextResponse.json({ status: res.status, error: `Please specify a device ID`, data });
            }
            return NextResponse.json({ status: res.status, error: `Couldn't fetch data`, data });
        }

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({ status: 500, error: 'There\'s been some problem.' });
    }
}
