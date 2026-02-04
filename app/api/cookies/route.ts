import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const param = searchParams.get("param");

  try {
    if (!param) {
      return NextResponse.json(
        { error: "Must include a query param, param. For example, /api/cookies?param=access_token" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const data = cookieStore.get(param);

    if (!data) {
      return NextResponse.json({ error: `The cookie ${param} does not exist` }, { status: 404 });
    }

    return NextResponse.json({ status: 200, data });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
