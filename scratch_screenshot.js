const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1200 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  // Scroll down a bit to see the countdown section clearly
  await page.evaluate(() => {
    window.scrollBy(0, 1100);
  });
  // Wait a bit for scroll and animations
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: '/Users/tusharlanghnoda/.gemini/antigravity/brain/b270cf1f-2424-49e1-9072-c946427870d6/scratch/current_view.png' });
  await browser.close();
})();
