import { chromium, devices } from "playwright";

const urls = [
  "https://glp1-tracker.onrender.com/login",
  "https://glp1-tracker.onrender.com/",
];

const browser = await chromium.launch({ headless: true });

for (const deviceName of ["Desktop Chrome", "Pixel 5", "Galaxy S9+"]) {
  const device = deviceName === "Desktop Chrome" ? null : devices[deviceName];
  const context = await browser.newContext(device ?? { viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}\n${e.stack}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });

  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(5000);
      const text = await page.locator("body").innerText();
      console.log(`\n=== ${deviceName} | ${url} ===`);
      console.log("Body:", text.slice(0, 500).replace(/\n/g, " | "));
      if (errors.length) console.log("Errors:\n", errors.join("\n---\n"));
      else console.log("Errors: (none)");
      errors.length = 0;
    } catch (e) {
      console.log(`\n=== ${deviceName} | ${url} === FAILED:`, e.message);
    }
  }
  await context.close();
}

await browser.close();
