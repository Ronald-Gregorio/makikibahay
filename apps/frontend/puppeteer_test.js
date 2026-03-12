const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    let hasError = false;

    page.on('console', msg => {
        const text = msg.text();
        console.log('[BROWSER CONSOLE]:', text);
        if (text.includes('TypeError: render is not a function') || text.includes('updateContextConsumer')) {
            hasError = true;
        }
    });

    page.on('pageerror', err => {
        console.log('[BROWSER ERROR]:', err.message);
        if (err.message.includes('render is not a function')) {
            hasError = true;
        }
    });

    console.log('Navigating to Create Listing page...');
    try {
        await page.goto('http://localhost:3002/owner/listings/create', { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) {
        console.log('Navigation error:', e.message);
    }

    // Check page content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- PAGE TEXT PREVIEW ---');
    console.log(bodyText.slice(0, 500));

    if (bodyText.includes('We could not load your management tools') || hasError) {
        console.log('\n>>> RESULT: CRASH DETECTED. The "render is not a function" error persists! <<<');
    } else {
        console.log('\n>>> RESULT: SUCCESS! The page rendered without the React Context crash. <<<');
    }

    await browser.close();
})();
