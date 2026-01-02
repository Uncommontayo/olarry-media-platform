import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.URL || 'http://localhost:5174/';
const outDir = path.resolve(process.cwd(), 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch();
  try {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      console.log(`Capturing ${vp.name} ${vp.width}x${vp.height}...`);
      await page.goto(url, { waitUntil: 'networkidle' });
      // Give animations a moment to settle
      await page.waitForTimeout(300);
      const outPath = path.join(outDir, `${vp.name}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }
    console.log('All screenshots captured.');
  } catch (e) {
    console.error('Screenshot run failed:', e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();