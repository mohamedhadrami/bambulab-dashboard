import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    let searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const param = searchParams.get('param');

    try {
        if (!param) {
            throw new Error('Must include a query param, param. For example, /api/cookies?param=token');
        }

        const data = cookies().get(param);
        if (!data) throw new Error(`The cookie ${param} does not exist`);

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
