import { createHash, randomInt, randomUUID } from "node:crypto";
import { isIP } from "node:net";

import type { CreatePasteInput, PasteRecord } from "@/lib/types";

const MAX_CONTENT_LENGTH = 250_000;
const MAX_TITLE_LENGTH = 80;
const SHARE_TTL_MS = 10 * 60 * 1000;
const ACCESS_CODE_PATTERN = /^\d{6}$/;
const ID_PATTERN = /^[a-f0-9-]{36}$/i;

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_FILE_BYTES + MAX_CONTENT_LENGTH * 4 + 128 * 1024;
export const SHARE_TTL_MINUTES = 10;

const ALLOWED_LANGUAGES = new Set([
  "plain",
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "html",
  "css",
  "bash",
  "python",
  "sql",
  "markdown",
  "yaml",
]);

interface MemoryShare {
  expiresAtMs: number;
  fileBuffer: Buffer | null;
  paste: PasteRecord;
  timer: ReturnType<typeof setTimeout>;
}

interface MemoryState {
  codes: Map<string, string>;
  pastes: Map<string, MemoryShare>;
  rateLimits: Map<string, { count: number; expiresAtMs: number }>;
}

interface RedisConfig {
  token: string;
  url: string;
}

declare global {
  // Keep dev storage stable across Next.js hot reloads in the same process.
  var __blinkportMemoryState: MemoryState | undefined;
}

const memoryState = (globalThis.__blinkportMemoryState ??= {
  codes: new Map(),
  pastes: new Map(),
  rateLimits: new Map(),
});

export class PasteInputError extends Error {}
export class TemporaryStorageError extends Error {}

const CREATE_SHARE_SCRIPT = `
if redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[3], "NX") then
  redis.call("SET", KEYS[2], ARGV[2], "PX", ARGV[3])
  return 1
end
return 0
`;

const RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return count
`;

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url && !token) {
    if (process.env.NODE_ENV === "production") {
      throw new TemporaryStorageError("Temporary storage is not configured.");
    }

    return null;
  }

  if (!url || !token) {
    throw new TemporaryStorageError("Temporary storage is not configured correctly.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new TemporaryStorageError("Temporary storage is not configured correctly.");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new TemporaryStorageError("Temporary storage must use HTTPS.");
  }

  return { token, url: parsedUrl.toString() };
}

async function redisCommand<T>(config: RedisConfig, command: string[]): Promise<T> {
  let response: Response;
  try {
    response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new TemporaryStorageError("Temporary storage is unavailable.");
  }

  let payload: { error?: unknown; result?: T };
  try {
    payload = (await response.json()) as { error?: unknown; result?: T };
  } catch {
    throw new TemporaryStorageError("Temporary storage is unavailable.");
  }

  if (!response.ok || payload.error !== undefined) {
    throw new TemporaryStorageError("Temporary storage is unavailable.");
  }

  return payload.result as T;
}

function normalizeTitle(value: string) {
  const trimmed = value.trim();
  return (trimmed || "Untitled share").slice(0, MAX_TITLE_LENGTH);
}

function normalizeMode(value: string): PasteRecord["mode"] {
  return value === "code" || value === "file" ? value : "text";
}

function normalizeLanguage(value: string, mode: PasteRecord["mode"]) {
  if (mode !== "code") return "plain";
  return ALLOWED_LANGUAGES.has(value) ? value : "typescript";
}

function sanitizeFileName(fileName: string) {
  const basename = fileName.split(/[\\/]/).pop() ?? "";
  const safeName = basename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
  return safeName || "upload.bin";
}

function validatePaste(input: CreatePasteInput) {
  if (input.attachment && input.attachment.size > MAX_FILE_BYTES) {
    throw new PasteInputError("Files must be 5 MB or smaller.");
  }

  if (input.content.length > MAX_CONTENT_LENGTH) {
    throw new PasteInputError(`Paste content must stay below ${MAX_CONTENT_LENGTH.toLocaleString()} characters.`);
  }

  if (!input.content.trim() && !input.attachment) {
    throw new PasteInputError(input.mode === "file" ? "Attach a file or add a quick note." : "Paste content cannot be empty.");
  }
}

function removeMemoryShare(id: string) {
  const entry = memoryState.pastes.get(id);
  if (!entry) return;

  clearTimeout(entry.timer);
  memoryState.pastes.delete(id);
  if (memoryState.codes.get(entry.paste.accessCode) === id) {
    memoryState.codes.delete(entry.paste.accessCode);
  }
}

function pruneMemoryState(now = Date.now()) {
  for (const [id, entry] of memoryState.pastes) {
    if (entry.expiresAtMs <= now) removeMemoryShare(id);
  }

  for (const [key, bucket] of memoryState.rateLimits) {
    if (bucket.expiresAtMs <= now) memoryState.rateLimits.delete(key);
  }
}

function newMemoryShare(paste: PasteRecord, fileBuffer: Buffer | null) {
  const expiresAtMs = new Date(paste.expiresAt).getTime();
  const timer = setTimeout(() => removeMemoryShare(paste.id), Math.max(0, expiresAtMs - Date.now()));
  timer.unref?.();
  memoryState.pastes.set(paste.id, { expiresAtMs, fileBuffer, paste, timer });
  memoryState.codes.set(paste.accessCode, paste.id);
}

function generateAccessCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function getClientIdentifier(request: Request) {
  const configuredHops = process.env.TRUSTED_PROXY_HOPS;
  const trustedHops = configuredHops
    ? Number(configuredHops)
    : process.env.NODE_ENV === "production"
      ? null
      : 1;
  const forwardedAddresses = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const forwardedAddress =
    typeof trustedHops === "number" && Number.isSafeInteger(trustedHops) && trustedHops > 0
      ? forwardedAddresses?.at(-trustedHops)
      : undefined;
  const address = forwardedAddress && isIP(forwardedAddress) ? forwardedAddress : "unknown";

  return createHash("sha256").update(address).digest("hex");
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const config = getRedisConfig();
  const safeKey = createHash("sha256").update(key).digest("hex");
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  if (config) {
    const count = await redisCommand<number>(config, [
      "EVAL",
      RATE_LIMIT_SCRIPT,
      "1",
      `blinkport:ratelimit:${safeKey}`,
      String(windowSeconds),
    ]);
    return count <= limit;
  }

  pruneMemoryState();
  const now = Date.now();
  const current = memoryState.rateLimits.get(safeKey);
  const bucket = !current || current.expiresAtMs <= now
    ? { count: 0, expiresAtMs: now + windowMs }
    : current;
  bucket.count += 1;
  memoryState.rateLimits.set(safeKey, bucket);
  return bucket.count <= limit;
}

export async function createPaste(input: CreatePasteInput) {
  validatePaste(input);
  const config = getRedisConfig();
  const mode = normalizeMode(input.mode);
  const content = input.content.trimEnd();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SHARE_TTL_MS);
  const id = randomUUID();
  const attachment = input.attachment;
  const storedAttachment = attachment
    ? {
        mimeType: attachment.mimeType || "application/octet-stream",
        originalName: sanitizeFileName(attachment.originalName),
        size: attachment.size,
        storedName: `${id}-${sanitizeFileName(attachment.originalName)}`,
      }
    : null;

  if (!config) {
    pruneMemoryState();
    let accessCode = generateAccessCode();
    for (let attempt = 0; memoryState.codes.has(accessCode) && attempt < 25; attempt += 1) {
      accessCode = generateAccessCode();
    }
    if (memoryState.codes.has(accessCode)) {
      throw new Error("Could not generate a unique access code. Please try again.");
    }

    const paste: PasteRecord = {
      accessCode,
      attachment: storedAttachment,
      content,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      id,
      language: normalizeLanguage(input.language, mode),
      mode,
      title: normalizeTitle(input.title),
    };
    newMemoryShare(paste, attachment?.buffer ?? null);
    return paste;
  }

  const pasteKey = `blinkport:paste:${id}`;
  const fileKey = `blinkport:file:${id}`;
  let fileStored = false;

  try {
    if (attachment) {
      const fileTtlMs = Math.max(1, expiresAt.getTime() - Date.now());
      await redisCommand<string>(config, ["SET", fileKey, attachment.buffer.toString("base64"), "PX", String(fileTtlMs)]);
      fileStored = true;
    }

    for (let attempt = 0; attempt < 25; attempt += 1) {
      const accessCode = generateAccessCode();
      const paste: PasteRecord = {
        accessCode,
        attachment: storedAttachment,
        content,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        id,
        language: normalizeLanguage(input.language, mode),
        mode,
        title: normalizeTitle(input.title),
      };
      const inserted = await redisCommand<number>(config, [
        "EVAL",
        CREATE_SHARE_SCRIPT,
        "2",
        `blinkport:code:${accessCode}`,
        pasteKey,
        id,
        JSON.stringify(paste),
        String(Math.max(1, expiresAt.getTime() - Date.now())),
      ]);

      if (inserted === 1) return paste;
    }

    throw new Error("Could not generate a unique access code. Please try again.");
  } catch (error) {
    if (fileStored) {
      try {
        await redisCommand<number>(config, ["DEL", fileKey]);
      } catch {
        // The file key has the same short TTL and will expire if cleanup fails.
      }
    }
    throw error;
  }
}

export async function getPasteById(id: string): Promise<PasteRecord | null> {
  if (!ID_PATTERN.test(id)) return null;
  const config = getRedisConfig();

  if (!config) {
    pruneMemoryState();
    return memoryState.pastes.get(id)?.paste ?? null;
  }

  const raw = await redisCommand<string | null>(config, ["GET", `blinkport:paste:${id}`]);
  if (!raw) return null;

  try {
    const paste = JSON.parse(raw) as PasteRecord;
    if (new Date(paste.expiresAt).getTime() <= Date.now()) return null;
    return paste;
  } catch {
    return null;
  }
}

export async function getPasteByAccessCode(accessCode: string): Promise<PasteRecord | null> {
  if (!ACCESS_CODE_PATTERN.test(accessCode)) return null;
  const config = getRedisConfig();

  if (!config) {
    pruneMemoryState();
    const id = memoryState.codes.get(accessCode);
    return id ? memoryState.pastes.get(id)?.paste ?? null : null;
  }

  const id = await redisCommand<string | null>(config, ["GET", `blinkport:code:${accessCode}`]);
  return id ? getPasteById(id) : null;
}

export async function getPasteFileBuffer(id: string) {
  const paste = await getPasteById(id);
  if (!paste?.attachment) return null;

  const config = getRedisConfig();
  if (!config) {
    pruneMemoryState();
    const fileBuffer = memoryState.pastes.get(id)?.fileBuffer;
    return fileBuffer ? { buffer: fileBuffer, paste } : null;
  }

  const encoded = await redisCommand<string | null>(config, ["GET", `blinkport:file:${id}`]);
  if (!encoded) return null;

  return { buffer: Buffer.from(encoded, "base64"), paste };
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRemainingTime(expiresAt: string) {
  const milliseconds = new Date(expiresAt).getTime() - Date.now();
  if (milliseconds <= 0) return "expired";
  return `${Math.ceil(milliseconds / 60_000)} min left`;
}
