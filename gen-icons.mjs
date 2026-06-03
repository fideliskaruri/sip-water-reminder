import { chromium } from "playwright";

// Renders the Sip app icon at several sizes into public/ using headless Chromium.
const icons = [
  { file: "pwa-192.png", size: 192, pad: 0.16, flat: false },
  { file: "pwa-512.png", size: 512, pad: 0.16, flat: false },
  { file: "pwa-maskable-512.png", size: 512, pad: 0.3, flat: true }, // full-bleed + safe zone
  { file: "apple-touch-icon-180.png", size: 180, pad: 0.16, flat: true },
];

const browser = await chromium.launch();
for (const ic of icons) {
  const page = await browser.newPage({
    viewport: { width: ic.size, height: ic.size },
    deviceScaleFactor: 1,
  });
  const drop = ic.size * (1 - ic.pad * 2);
  const radius = ic.flat ? 0 : ic.size * 0.22;
  const html = `<!doctype html><html><body style="margin:0">
    <div style="width:${ic.size}px;height:${ic.size}px;border-radius:${radius}px;overflow:hidden;
      background:linear-gradient(135deg,#5bd1ff,#2f8fff);display:grid;place-items:center">
      <svg width="${drop}" height="${drop}" viewBox="0 0 100 100">
        <path d="M50 6 C50 6 84 46 84 68 A34 34 0 1 1 16 68 C16 46 50 6 50 6 Z" fill="#ffffff"/>
        <ellipse cx="38" cy="66" rx="9" ry="14" fill="#cfecff" opacity="0.6"/>
      </svg>
    </div></body></html>`;
  await page.setContent(html);
  await page.screenshot({ path: "public/" + ic.file, omitBackground: !ic.flat });
  await page.close();
  console.log("wrote", ic.file);
}
await browser.close();
console.log("done");
