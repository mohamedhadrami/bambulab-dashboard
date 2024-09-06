import { NextResponse } from 'next/server';
import { getAllReleases } from '@/lib/releases';

export async function GET() {
    const releases = getAllReleases();
    return NextResponse.json(releases);
}
