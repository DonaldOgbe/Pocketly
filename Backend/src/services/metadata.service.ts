import * as cheerio from "cheerio";

const fetchHtml = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  console.log(`Fetched ${html.length} characters from ${url}`);

  return html;
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
  const html = await fetchHtml(url);
  const metadata = extractMetadata(html, url);

  return metadata;
};
