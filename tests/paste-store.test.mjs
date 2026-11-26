import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { validateLaunchConfig } from "../scripts/launch-preflight.mjs";
import {
  consumeRateLimit,
  createPaste,
  getPasteByAccessCode,
  getPasteById,
  getPasteFileBuffer,
  getClientIdentifier,
  MAX_FILE_BYTES,
} from "../lib/paste-store.ts";

function textPaste(content = "temporary test content") {
  return {
    content,
    language: "plain",
    mode: "text",
    title: `Test ${randomUUID()}`,
  };
}

test("launch preflight accepts complete production settings", () => {
  assert.deepEqual(
    validateLaunchConfig({
      NEXT_PUBLIC_SITE_URL: "https://blinkport-launch-check.com",
      NEXT_PUBLIC_SUPPORT_EMAIL: "support@blinkport-launch-check.com",
      NEXT_PUBLIC_COMPANY_NAME: "Blinkport",
      TRUSTED_PROXY_HOPS: "1",
      UPSTASH_REDIS_REST_URL: "https://region-123.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "launch-check-token",
    }),
    [],
  );
});

test("build preflight checks public settings without requiring runtime secrets", () => {
  assert.deepEqual(
    validateLaunchConfig(
      {
        NEXT_PUBLIC_SITE_URL: "https://blinkport-launch-check.com",
        NEXT_PUBLIC_SUPPORT_EMAIL: "support@blinkport-launch-check.com",
        NEXT_PUBLIC_COMPANY_NAME: "Blinkport",
        TRUSTED_PROXY_HOPS: "1",
      },
      { includeRedis: false },
    ),
    [],
  );
});

test("launch preflight rejects placeholders and incomplete infrastructure", () => {
  const errors = validateLaunchConfig({
    NEXT_PUBLIC_SITE_URL: "https://your-domain.example",
    NEXT_PUBLIC_SUPPORT_EMAIL: "support@your-domain.example",
    NEXT_PUBLIC_COMPANY_NAME: "Blinkport",
    TRUSTED_PROXY_HOPS: "0",
    UPSTASH_REDIS_REST_URL: "https://your-database.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "replace-with-your-token",
  });

  assert.equal(errors.length, 5);
});

test("creates shares with a unique six-digit code and a ten-minute lifetime", async () => {
  const paste = await createPaste(textPaste());

  assert.match(paste.accessCode, /^\d{6}$/);
  assert.equal(Date.parse(paste.expiresAt) - Date.parse(paste.createdAt), 10 * 60 * 1000);
  assert.equal((await getPasteByAccessCode(paste.accessCode))?.id, paste.id);
  assert.equal((await getPasteById(paste.id))?.content, "temporary test content");
});

test("concurrent creates retain every share and issue distinct access codes", async () => {
  const pastes = await Promise.all(Array.from({ length: 30 }, (_, index) => createPaste(textPaste(`share ${index}`))));

  assert.equal(new Set(pastes.map((paste) => paste.accessCode)).size, pastes.length);
  const stored = await Promise.all(pastes.map((paste) => getPasteById(paste.id)));
  assert.equal(stored.filter(Boolean).length, pastes.length);
});

test("stores file bytes with the temporary share and serves them back", async () => {
  const buffer = Buffer.from("short-lived file payload");
  const paste = await createPaste({
    ...textPaste(""),
    attachment: {
      buffer,
      mimeType: "text/plain",
      originalName: "sample.txt",
      size: buffer.byteLength,
    },
    mode: "file",
  });
  const result = await getPasteFileBuffer(paste.id);

  assert.ok(result);
  assert.deepEqual(result.buffer, buffer);
});

test("expired shares are removed from the in-memory lookup indexes", async () => {
  const paste = await createPaste(textPaste());
  const entry = globalThis.__blinkportMemoryState.pastes.get(paste.id);
  entry.expiresAtMs = Date.now() - 1;

  assert.equal(await getPasteById(paste.id), null);
  assert.equal(await getPasteByAccessCode(paste.accessCode), null);
  assert.equal(globalThis.__blinkportMemoryState.pastes.has(paste.id), false);
});

test("rate limits lookup attempts after the configured threshold", async () => {
  const key = `test:${randomUUID()}`;

  assert.equal(await consumeRateLimit(key, 2, 60_000), true);
  assert.equal(await consumeRateLimit(key, 2, 60_000), true);
  assert.equal(await consumeRateLimit(key, 2, 60_000), false);
});

test("rate-limit identity uses the configured trusted proxy hop, not spoofed leading IPs", () => {
  const previousHops = process.env.TRUSTED_PROXY_HOPS;
  process.env.TRUSTED_PROXY_HOPS = "1";

  try {
    const spoofedForwardingChain = new Request("https://blinkport.test", {
      headers: { "x-forwarded-for": "198.51.100.77, 203.0.113.20", "x-real-ip": "198.51.100.77" },
    });
    const trustedAddress = new Request("https://blinkport.test", {
      headers: { "x-forwarded-for": "203.0.113.20" },
    });

    assert.equal(getClientIdentifier(spoofedForwardingChain), getClientIdentifier(trustedAddress));

    process.env.TRUSTED_PROXY_HOPS = "2";
    const twoProxyHops = new Request("https://blinkport.test", {
      headers: { "x-forwarded-for": "198.51.100.77, 203.0.113.20, 192.0.2.4" },
    });
    const twoProxyReference = new Request("https://blinkport.test", {
      headers: { "x-forwarded-for": "203.0.113.20, 192.0.2.4" },
    });

    assert.equal(getClientIdentifier(twoProxyHops), getClientIdentifier(twoProxyReference));
  } finally {
    if (previousHops === undefined) {
      delete process.env.TRUSTED_PROXY_HOPS;
    } else {
      process.env.TRUSTED_PROXY_HOPS = previousHops;
    }
  }
});

test("production rate-limit identity fails closed without trusted proxy configuration", () => {
  const previousHops = process.env.TRUSTED_PROXY_HOPS;
  const previousNodeEnv = process.env.NODE_ENV;
  delete process.env.TRUSTED_PROXY_HOPS;
  process.env.NODE_ENV = "production";

  try {
    const firstAddress = new Request("https://blinkport.test", {
      headers: { "x-forwarded-for": "203.0.113.20" },
    });
    const spoofedAddress = new Request("https://blinkport.test", {
      headers: { "x-forwarded-for": "198.51.100.77" },
    });

    assert.equal(getClientIdentifier(firstAddress), getClientIdentifier(spoofedAddress));
  } finally {
    if (previousHops === undefined) {
      delete process.env.TRUSTED_PROXY_HOPS;
    } else {
      process.env.TRUSTED_PROXY_HOPS = previousHops;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});

test("rejects files above the upload limit", async () => {
  await assert.rejects(
    createPaste({
      ...textPaste(""),
      attachment: {
        buffer: Buffer.alloc(0),
        mimeType: "application/octet-stream",
        originalName: "too-large.bin",
        size: MAX_FILE_BYTES + 1,
      },
      mode: "file",
    }),
    /5 MB or smaller/,
  );
});
