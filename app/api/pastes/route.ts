import { NextResponse } from "next/server";

import {
  consumeRateLimit,
  createPaste,
  getClientIdentifier,
  MAX_FILE_BYTES,
  MAX_REQUEST_BYTES,
  PasteInputError,
  TemporaryStorageError,
} from "@/lib/paste-store";
import { parseMultipartFormData } from "@/lib/multipart-form";
import type { PasteMode } from "@/lib/types";

export const runtime = "nodejs";

interface ParsedPasteRequest {
  content: string;
  file: File | null;
  language: string;
  mode: PasteMode;
  title: string;
}

const MULTIPART_HEADER_SEPARATOR = Buffer.from("\r\n\r\n");

class RequestBodyTooLargeError extends Error {}

function parseMode(value: unknown): PasteMode {
  return value === "code" || value === "file" ? value : "text";
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readMultipartBoundary(contentType: string) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  return match?.[1] ?? match?.[2] ?? null;
}

function parseMultipartFallback(buffer: Buffer, contentType: string): ParsedPasteRequest {
  const boundary = readMultipartBoundary(contentType);
  if (!boundary) throw new PasteInputError("Missing multipart boundary.");

  const delimiter = Buffer.from(`--${boundary}`);
  const fields = new Map<string, string>();
  let file: File | null = null;
  let cursor = 0;

  while (cursor < buffer.length) {
    const partStart = buffer.indexOf(delimiter, cursor);
    if (partStart === -1) break;

    let cursorStart = partStart + delimiter.length;
    if (buffer[cursorStart] === 45 && buffer[cursorStart + 1] === 45) break;
    if (buffer[cursorStart] === 13 && buffer[cursorStart + 1] === 10) cursorStart += 2;

    const headerEnd = buffer.indexOf(MULTIPART_HEADER_SEPARATOR, cursorStart);
    if (headerEnd === -1) break;

    const headerText = buffer.toString("utf8", cursorStart, headerEnd);
    const nextBoundary = buffer.indexOf(delimiter, headerEnd + MULTIPART_HEADER_SEPARATOR.length);
    if (nextBoundary === -1) break;

    const contentStart = headerEnd + MULTIPART_HEADER_SEPARATOR.length;
    const contentBuffer = buffer.subarray(contentStart, Math.max(contentStart, nextBoundary - 2));
    const headers = new Map<string, string>();
    for (const line of headerText.split("\r\n")) {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex !== -1) {
        headers.set(line.slice(0, separatorIndex).trim().toLowerCase(), line.slice(separatorIndex + 1).trim());
      }
    }

    const disposition = headers.get("content-disposition") ?? "";
    const name = /name="?([^";]+)"?/i.exec(disposition)?.[1];
    if (!name) {
      cursor = nextBoundary;
      continue;
    }

    const filename = /filename="?([^"]*)"?/i.exec(disposition)?.[1];
    if (filename) {
      file = new File([Uint8Array.from(contentBuffer)], filename, {
        type: headers.get("content-type") ?? "application/octet-stream",
      });
    } else {
      fields.set(name, contentBuffer.toString("utf8"));
    }
    cursor = nextBoundary;
  }

  return {
    content: fields.get("content") ?? "",
    file,
    language: fields.get("language") ?? "plain",
    mode: parseMode(fields.get("mode")),
    title: fields.get("title") ?? "",
  };
}

async function readBoundedBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new RequestBodyTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // The request is oversized regardless of whether the stream cancels cleanly.
        }
        throw new RequestBodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, totalBytes);
}

async function parsePasteRequest(request: Request): Promise<ParsedPasteRequest> {
  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const contentType = contentTypeHeader.toLowerCase();
  const body = await readBoundedBody(request);

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await parseMultipartFormData(body, request);
      const formString = (name: string, fallback = "") => readString(formData.get(name), fallback);
      const fileValue = formData.get("file");
      return {
        content: formString("content"),
        file: fileValue instanceof File && fileValue.size > 0 ? fileValue : null,
        language: formString("language", "plain"),
        mode: parseMode(formString("mode")),
        title: formString("title"),
      };
    } catch {
      return parseMultipartFallback(body, contentTypeHeader);
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body.toString("utf8"));
    return {
      content: params.get("content") ?? "",
      file: null,
      language: params.get("language") ?? "plain",
      mode: parseMode(params.get("mode")),
      title: params.get("title") ?? "",
    };
  }

  if (contentType.includes("application/json")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body.toString("utf8"));
    } catch {
      throw new PasteInputError("The request body is not valid JSON.");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new PasteInputError("The request body must be a JSON object.");
    }

    const json = parsed as Record<string, unknown>;
    return {
      content: readString(json.content),
      file: null,
      language: readString(json.language, "plain"),
      mode: parseMode(json.mode),
      title: readString(json.title),
    };
  }

  throw new PasteInputError("Unsupported content type.");
}

function jsonError(message: string, status: number, retryAfter?: number) {
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(request: Request) {
  try {
    const identifier = getClientIdentifier(request);
    if (!(await consumeRateLimit(`create:${identifier}`, 10, 60_000))) {
      return jsonError("Too many shares created. Please wait a minute and try again.", 429, 60);
    }

    const parsedRequest = await parsePasteRequest(request);
    if (parsedRequest.file && parsedRequest.file.size > MAX_FILE_BYTES) {
      return jsonError("Files must be 5 MB or smaller.", 413);
    }

    const paste = await createPaste({
      attachment: parsedRequest.file
        ? {
            buffer: Buffer.from(await parsedRequest.file.arrayBuffer()),
            mimeType: parsedRequest.file.type,
            originalName: parsedRequest.file.name,
            size: parsedRequest.file.size,
          }
        : undefined,
      content: parsedRequest.content,
      language: parsedRequest.language,
      mode: parsedRequest.mode,
      title: parsedRequest.title,
    });

    return NextResponse.json(
      { accessCode: paste.accessCode, expiresAt: paste.expiresAt, id: paste.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonError("The request is too large. Files are limited to 5 MB.", 413);
    }
    if (error instanceof PasteInputError) return jsonError(error.message, 400);
    if (error instanceof TemporaryStorageError) {
      return jsonError("Temporary storage is unavailable.", 503);
    }
    return jsonError("Unable to create the share right now. Please try again.", 500);
  }
}
