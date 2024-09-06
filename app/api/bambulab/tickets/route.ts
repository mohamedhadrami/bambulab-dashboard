// @/app/api/bambulab/tickets

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function GET(request: NextRequest) {
    let searchParams = new URLSearchParams(request.nextUrl.searchParams);

    const queryParams = request.nextUrl.searchParams.toString();

    const BASE_URL: string = "https://api.bambulab.com";
    const endpoint = `/v1/aftersale-service/trouble/list?ticketId=asdasd`;//`/v1/aftersale-service/trouble/list?${queryParams}`;
    /**
     * /v1/aftersale-service/trouble/list
     * /v1/aftersale-service/trouble/totalunreadcount
     */

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
            return NextResponse.json({ status: res.status, error: `Couldn't fetch data`, data });
        }

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({  status: 500, error: 'There\'s been some problem.' });
    }
}
