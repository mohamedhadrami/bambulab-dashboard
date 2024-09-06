// @/app/api/bambulab/slicer-codes

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Gets list of all slicer profiles. Provides each setting, its id, and some details.
 * @queryParam version: Slicer version from /v1/iot-service/api/slicer/resource GET call
 * @endpoint /v1/iot-service/api/slicer/setting?version=${version}
 * @returns List of print, printer, and filament profiles
 */
export async function GET(request: NextRequest) {
    let searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const version = searchParams.get('version');

    const queryParams = request.nextUrl.searchParams.toString();


    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/iot-service/api/slicer/setting?${queryParams}`;

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
            if (!version) {
                return NextResponse.json({ status: res.status, error: `Please specify a version`, data });
            }
            return NextResponse.json({ status: res.status, error: `Couldn't fetch data`, data });
        }

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({  status: 500, error: 'There\'s been some problem.' });
    }
}
