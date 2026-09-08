import { chromium } from "playwright";

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error("Usage: node scripts/check-page-errors.mjs <url>...");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });

for (const url of urls) {
  const page = await browser.newPage();
  const errors = [];

  page.on("pageerror", (e) => {
    errors.push(`PAGEERROR: ${e.message}\n${e.stack?.split("\n").slice(0, 8).join("\n")}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(4000);
    const text = await page.locator("body").innerText();
    console.log(`\n=== ${url} ===`);
    console.log("Body preview:", text.slice(0, 400).replace(/\n/g, " | "));
    console.log("Errors:", errors.length ? errors.join("\n---\n") : "(none)");
  } catch (err) {
    console.log(`\n=== ${url} ===`);
    console.log("Navigation failed:", err.message);
    if (errors.length) console.log(errors.join("\n---\n"));
  }

  await page.close();
}

await browser.close();
