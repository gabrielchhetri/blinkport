import { NextResponse } from "next/server";

import { consumeRateLimit, getClientIdentifier, getPasteFileBuffer } from "@/lib/paste-store";

export const runtime = "nodejs";

interface FileRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: FileRouteProps) {
  try {
    const identifier = getClientIdentifier(request);
    if (!(await consumeRateLimit(`download:${identifier}`, 20, 60_000))) {
      return NextResponse.json(
        { error: "Too many downloads. Please wait a minute and try again." },
        { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
      );
    }

    const { id } = await params;
    const result = await getPasteFileBuffer(id);
    if (!result) {
      return NextResponse.json(
        { error: "File not found or share expired." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return new NextResponse(result.buffer, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.paste.attachment?.originalName ?? "download.bin")}"`,
        "Content-Length": String(result.buffer.byteLength),
        "Content-Type": "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "File download is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
