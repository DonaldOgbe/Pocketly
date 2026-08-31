import { lookup } from "node:dns/promises";
import net from "node:net";
import * as cheerio from "cheerio";

// A bookmarked page is someone else's server. Without this a slow or hanging
// host holds the connection open indefinitely.
const FETCH_TIMEOUT_MS = 10_000;

const MAX_REDIRECTS = 5;

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number) as [number, number];

    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return a >= 224;
  }

  if (net.isIPv6(ip)) {
    const value = ip.toLowerCase();

    const mappedIpv4 = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mappedIpv4?.[1]) return isPrivateAddress(mappedIpv4[1]);

    if (value === "::" || value === "::1") return true;
    return value.startsWith("fe80") || value.startsWith("fc") || value.startsWith("fd");
  }

  return true;
}

// Users choose these URLs, so the server would otherwise happily fetch
// 169.254.169.254 or anything else inside the network it runs in.
async function assertPublicHost(url: URL) {
  const { address } = await lookup(url.hostname);

  if (isPrivateAddress(address)) {
    throw new Error(`Refusing to fetch a private address: ${url.hostname}`);
  }
}

const fetchHtml = async (url: string) => {
  let current = new URL(url);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    // Checked every hop: a public URL can redirect into the private range.
    await assertPublicHost(current);

    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error(`Redirect with no location from ${current.href}`);
      }

      current = new URL(location, current);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} characters from ${current.href}`);

    return { html, finalUrl: current.href };
  }

  throw new Error(`Too many redirects for ${url}`);
};

const extractMetadata = (html: string, url: string) => {
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    "Untitled page";

  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    null;

  const thumbnail =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null;

  const faviconHref =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    null;

  const favicon = faviconHref ? new URL(faviconHref, url).href : null;

  return { title, description, thumbnail, favicon };
};

export const getMetadata = async (url: string) => {
  // Relative favicons resolve against where we ended up, not where we started.
  const { html, finalUrl } = await fetchHtml(url);

  return extractMetadata(html, finalUrl);
};
