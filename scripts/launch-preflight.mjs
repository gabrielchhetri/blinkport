import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER_PATTERN = /your-domain|your-database|replace-with|example\.com|\.example\b|\.test\b|\.invalid\b|changeme/i;

function isReservedHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "example.com" ||
    hostname.endsWith(".example.com") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid")
  );
}

export function validateLaunchConfig(env = process.env, { includeRedis = true } = {}) {
  const errors = [];
  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    errors.push("NEXT_PUBLIC_SITE_URL is required.");
  } else {
    try {
      const parsedSiteUrl = new URL(siteUrl);
      if (
        parsedSiteUrl.protocol !== "https:" ||
        parsedSiteUrl.username ||
        parsedSiteUrl.password ||
        parsedSiteUrl.pathname !== "/" ||
        parsedSiteUrl.search ||
        parsedSiteUrl.hash ||
        isReservedHost(parsedSiteUrl.hostname)
      ) {
        errors.push("NEXT_PUBLIC_SITE_URL must be a real HTTPS origin without a path, query, or fragment.");
      }
    } catch {
      errors.push("NEXT_PUBLIC_SITE_URL must be a valid HTTPS origin.");
    }
  }

  const supportEmail = env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  if (
    !supportEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) ||
    PLACEHOLDER_PATTERN.test(supportEmail)
  ) {
    errors.push("NEXT_PUBLIC_SUPPORT_EMAIL must be a real, monitored email address.");
  }

  const companyName = env.NEXT_PUBLIC_COMPANY_NAME?.trim();
  if (!companyName || PLACEHOLDER_PATTERN.test(companyName) || /^your company name$/i.test(companyName)) {
    errors.push("NEXT_PUBLIC_COMPANY_NAME must be set to the public-facing company or brand name.");
  }

  const trustedProxyHops = env.TRUSTED_PROXY_HOPS?.trim();
  const trustedProxyHopCount = trustedProxyHops ? Number(trustedProxyHops) : NaN;
  if (
    !trustedProxyHops ||
    !/^\d+$/.test(trustedProxyHops) ||
    !Number.isSafeInteger(trustedProxyHopCount) ||
    trustedProxyHopCount < 1
  ) {
    errors.push("TRUSTED_PROXY_HOPS must be a positive integer matching the production proxy chain.");
  }

  if (includeRedis) {
    const redisUrl = env.UPSTASH_REDIS_REST_URL?.trim();
    try {
      if (!redisUrl || new URL(redisUrl).protocol !== "https:" || PLACEHOLDER_PATTERN.test(redisUrl)) {
        errors.push("UPSTASH_REDIS_REST_URL must be a real HTTPS REST endpoint.");
      }
    } catch {
      errors.push("UPSTASH_REDIS_REST_URL must be a valid HTTPS REST endpoint.");
    }

    const redisToken = env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!redisToken || PLACEHOLDER_PATTERN.test(redisToken)) {
      errors.push("UPSTASH_REDIS_REST_TOKEN must be configured in the hosting provider's secret settings.");
    }
  }

  return errors;
}

async function verifyRedisConnection(env) {
  const response = await fetch(env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["PING"]),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error("Redis request failed.");

  const result = (await response.json())?.result;
  if (result !== "PONG") throw new Error("Unexpected Redis response.");
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const buildOnly = process.argv.includes("--build");
  const errors = validateLaunchConfig(process.env, { includeRedis: !buildOnly });

  if (errors.length === 0 && process.argv.includes("--verify-redis")) {
    try {
      await verifyRedisConnection(process.env);
    } catch {
      errors.push("Upstash Redis connection failed; verify the endpoint, token, and network access.");
    }
  }

  if (errors.length > 0) {
    console.error("Launch preflight failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`${buildOnly ? "Build" : "Launch"} preflight passed${process.argv.includes("--verify-redis") ? "; Redis responded to PING" : ""}. No secret values were printed.`);
  }
}
