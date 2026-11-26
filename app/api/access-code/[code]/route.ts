import { NextResponse } from "next/server";

import { consumeRateLimit, getClientIdentifier, getPasteByAccessCode } from "@/lib/paste-store";

export const runtime = "nodejs";

interface AccessCodeRouteProps {
  params: Promise<{
    code: string;
  }>;
}

export async function GET(request: Request, { params }: AccessCodeRouteProps) {
  try {
    const identifier = getClientIdentifier(request);
    if (!(await consumeRateLimit(`access:${identifier}`, 20, 60_000))) {
      return NextResponse.json(
        { error: "Too many code attempts. Please wait a minute and try again." },
        { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
      );
    }

    const { code } = await params;
    const paste = await getPasteByAccessCode(code);
    if (!paste) {
      return NextResponse.json(
        { error: "That code is invalid or has expired." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        accessCode: paste.accessCode,
        expiresAt: paste.expiresAt,
        id: paste.id,
        mode: paste.mode,
        title: paste.title,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Share lookup is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
