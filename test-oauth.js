const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Intercept console logs to catch Firebase errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('https://t3automations.com', { waitUntil: 'networkidle2' });
  
  // Find login button and click it
  // Wait for Google Auth redirect or error
  // Wait for 3 seconds to see any errors
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
  console.log("Done");
})();
