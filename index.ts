import * as puppeteer from "puppeteer";
import { URL } from "url";

const visitedUrls = new Set<string>();
const unicornPages: string[] = [];

async function findUnicorns(
  pageUrl: string,
  baseUrl: string,
  browser: puppeteer.Browser
) {
  const page = await browser.newPage();

  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

    // 🦄
    const pageContent = await page.content();
    if (pageContent.includes("🦄")) {
      unicornPages.push(pageUrl);
      console.log(`Unicorn found on: ${pageUrl}`);
    }

    const links = await page.$$eval("a", (anchors) =>
      anchors.map((anchor) => anchor.href)
    );

    for (const link of links) {
      const normalizedLink = new URL(link, baseUrl).href;

      if (
        normalizedLink.startsWith(baseUrl) &&
        !visitedUrls.has(normalizedLink)
      ) {
        visitedUrls.add(normalizedLink);
        await findUnicorns(normalizedLink, baseUrl, browser);
      }
    }
  } catch (error) {
    console.error(`Error visiting ${pageUrl}: ${error}`);
  } finally {
    await page.close();
  }
}

(async () => {
  const baseUrl = "https://www.volleytours.com/";
  const browser = await puppeteer.launch();

  try {
    visitedUrls.add(baseUrl);
    await findUnicorns(baseUrl, baseUrl, browser);

    console.log("Pages with unicorns found:", unicornPages);
  } catch (error) {
    console.error("An error occurred during crawling:", error);
  } finally {
    await browser.close();
  }
})();
