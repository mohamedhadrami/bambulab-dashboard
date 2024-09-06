// @/app/api/bambulab/profile

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Gets all data on a certain profile by setting ID
 * @param {string} SETTING_ID Setting ID from /v1/iot-service/api/slicer/setting?version=${SLICER_VERSION} GET call
 * @endpoint /v1/iot-service/api/slicer/setting/${SETTING_ID}
 * @returns Data of slicer setting
 */
export async function GET(request: NextRequest) {

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/user-service/my/profile`;

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
            if (!settingId) {
                return NextResponse.json({ status: res.status, error: `Please specify a setting ID`, data });
            }
            return NextResponse.json({ status: res.status, error: `Couldn't fetch data`, data });
        }

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({  status: 500, error: 'There\'s been some problem.' });
    }
}
