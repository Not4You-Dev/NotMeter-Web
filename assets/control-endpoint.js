(() => {
  "use strict";

  const SCHEMA = "notmeter-control-endpoint-v1";
  const VERSION = 1;
  const ALGORITHM = "RSA-SHA256-PKCS1-v1";
  const KEY_ID = "notmeter-ranking-2026-07";
  const PUBLIC_KEY_BASE64 = "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEArn8f2jGTdnIRUHtso8FmmUcmN7rgOzJ7lQRcy9e3Lekt8S2Tg8L1++9/8AKAhnY/hpJbdHkgdTvvv3oyGZVMU/owyv7u9CcmiKQm1dIx7JkoHz0fnBbpytyVRH9Y21HF/PyLX6GcHmkYsfA5keNq3BjK/C+3MTuC8h9EFGPlWBlDwTuLOq4ky4McZMBV5wAu15xLvcyPHeaUhGMuc2XufGyyLLXV2hHXpUsIKZineKWEyN3UoaCXnWzAw5VqSd6cfhB5jY3CFFnthMbQk62ddJUT2B6GWZHjz39rg0u6qSTuGWW1M3BfUR+F6GUllxgDumWmxPHfNcs5MI4rNGsKyuLRrk6z85EYIyL4eduEM8NaQQ5gY03BsgT81jTFfbG+PVgqgkz9t322JycjgCUKLlva0FlZzGXmE57d7N5KcxMlnfdpPq5dcmyvLN2J8vAK4Sct9bKjUEZWeA4npCIHpBPXob9WlTkuLPasWrkuHiUPPPx5xfZzmnRKmCswr0fdAgMBAAE=";
  const RAW_URL = "https://raw.githubusercontent.com/Not4You-Dev/NotMeter-Web/main/control/notmeter-control-endpoint.json";
  const SITE_URL = "https://notmeter.com/control/notmeter-control-endpoint.json";
  const API_URL = "https://api.github.com/repos/Not4You-Dev/NotMeter-Web/contents/control/notmeter-control-endpoint.json?ref=main";
  const STORAGE_KEY = "notmeter-control-endpoint-v1";
  const REFRESH_MS = 5 * 60 * 1000;
  const MAX_LIFETIME_SECONDS = 14 * 24 * 60 * 60;
  const LEGACY_HOSTS = new Set([
    "notmeter.112-168-140-142.sslip.io",
    "notmeter.112-168-140-142.nip.io",
  ]);
  const nativeFetch = window.fetch.bind(window);
  let verified = null;
  let refreshPromise = null;
  let nextRefreshAt = 0;

  const decodeBase64 = (value) => {
    const binary = atob(String(value || "").replace(/\s+/g, ""));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  };

  const normalizeEndpoint = (value) => {
    try {
      const url = new URL(String(value || "").trim());
      if (url.protocol !== "https:" || (url.port && url.port !== "443") ||
          url.username || url.password || url.search || url.hash ||
          (url.pathname && url.pathname !== "/")) return "";
      return `${url.protocol}//${url.hostname}`;
    } catch {
      return "";
    }
  };

  const normalizeDocument = (document) => {
    if (!document || document.schema !== SCHEMA || Number(document.version) !== VERSION ||
        document.signatureAlgorithm !== ALGORITHM || document.keyId !== KEY_ID ||
        !/^[0-9a-f]{12,64}$/i.test(String(document.generation || ""))) return null;
    const primary = normalizeEndpoint(document.primaryBaseUrl);
    const fallbacks = Array.isArray(document.fallbackBaseUrls)
      ? document.fallbackBaseUrls.slice(0, 3).map(normalizeEndpoint).filter(Boolean)
      : [];
    const endpoints = [...new Set([primary, ...fallbacks].filter(Boolean))];
    if (!endpoints.length) return null;
    const generatedAt = Number(document.generatedAtUnixSeconds);
    const validUntil = Number(document.validUntilUnixSeconds);
    if (!Number.isSafeInteger(generatedAt) || !Number.isSafeInteger(validUntil) ||
        generatedAt <= 0 || validUntil <= generatedAt ||
        validUntil - generatedAt > MAX_LIFETIME_SECONDS) return null;
    return {
      document,
      endpoints,
      generatedAt,
      validUntil,
      payload: [
        SCHEMA,
        String(VERSION),
        String(document.generation).trim().toLowerCase(),
        String(generatedAt),
        String(validUntil),
        endpoints[0],
        endpoints.slice(1).join(","),
        ALGORITHM,
        KEY_ID,
      ].join("\n"),
    };
  };

  const verifyDocument = async (document) => {
    const normalized = normalizeDocument(document);
    if (!normalized) return null;
    const now = Math.floor(Date.now() / 1000);
    if (normalized.generatedAt > now + 600 || now > normalized.validUntil) return null;
    try {
      const key = await crypto.subtle.importKey(
        "spki",
        decodeBase64(PUBLIC_KEY_BASE64),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]);
      const valid = await crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5" },
        key,
        decodeBase64(document.signature),
        new TextEncoder().encode(normalized.payload));
      return valid ? normalized : null;
    } catch {
      return null;
    }
  };

  const loadCached = async () => {
    try {
      const document = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const result = await verifyDocument(document);
      if (result) verified = result;
    } catch {
    }
  };

  const fetchJson = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await nativeFetch(`${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  const downloadDocument = async () => {
    const raw = await fetchJson(RAW_URL);
    if (raw) return raw;
    const site = await fetchJson(SITE_URL);
    if (site) return site;
    const envelope = await fetchJson(API_URL);
    if (!envelope || String(envelope.encoding || "").toLowerCase() !== "base64") return null;
    try {
      return JSON.parse(new TextDecoder().decode(decodeBase64(envelope.content)));
    } catch {
      return null;
    }
  };

  const refresh = async (force = false) => {
    if (refreshPromise) return refreshPromise;
    if (!force && Date.now() < nextRefreshAt) return;
    refreshPromise = (async () => {
      nextRefreshAt = Date.now() + REFRESH_MS;
      const document = await downloadDocument();
      const result = await verifyDocument(document);
      if (!result || (verified && result.generatedAt < verified.generatedAt)) return;
      verified = result;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(document)); } catch { }
    })().finally(() => { refreshPromise = null; });
    return refreshPromise;
  };

  const ready = loadCached();
  const getEndpoints = async () => {
    await ready;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!verified || nowSeconds > verified.validUntil) await refresh(true);
    else if (Date.now() >= nextRefreshAt) void refresh();
    if (!verified || Math.floor(Date.now() / 1000) > verified.validUntil) return [];
    return verified?.endpoints || [];
  };

  const rewriteUrl = (original, endpoint) => {
    const source = new URL(original);
    const target = new URL(endpoint);
    target.pathname = source.pathname;
    target.search = source.search;
    return target.toString();
  };

  window.fetch = async (input, init) => {
    const originalUrl = typeof input === "string" || input instanceof URL ? String(input) : input?.url;
    let parsed;
    try { parsed = new URL(originalUrl, window.location.href); } catch { return nativeFetch(input, init); }
    if (!LEGACY_HOSTS.has(parsed.hostname.toLowerCase())) return nativeFetch(input, init);

    const endpoints = await getEndpoints();
    if (!endpoints.length) throw new TypeError("The signed control endpoint is unavailable.");
    const baseRequest = input instanceof Request ? new Request(input, init) : new Request(parsed.toString(), init);
    let lastError = null;
    const attempted = new Set();
    for (const endpoint of endpoints) {
      attempted.add(endpoint);
      try {
        const response = await nativeFetch(new Request(rewriteUrl(parsed.toString(), endpoint), baseRequest.clone()));
        return response;
      } catch (error) {
        lastError = error;
      }
    }
    await refresh(true);
    const refreshedEndpoints = await getEndpoints();
    for (const endpoint of refreshedEndpoints.filter(value => !attempted.has(value))) {
      try {
        return await nativeFetch(new Request(rewriteUrl(parsed.toString(), endpoint), baseRequest.clone()));
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
    return nativeFetch(input, init);
  };

  window.NotMeterControlEndpoint = Object.freeze({ getEndpoints, refresh });
})();
