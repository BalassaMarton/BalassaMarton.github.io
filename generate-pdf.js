const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePaths = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
];

function findChrome() {
    for (const p of chromePaths) {
        if (p && fs.existsSync(p)) return p;
    }
    throw new Error('Chrome not found. Set CHROME_PATH or update chromePaths in generate-pdf.js.');
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: findChrome(),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const htmlPath = path.resolve(__dirname, 'index.html');
    // networkidle0 waits for Font Awesome icons to finish loading from CDN
    await page.goto(`file:///${htmlPath}`, { waitUntil: 'networkidle0' });

    const defaultOutputPath = path.resolve(__dirname, 'downloads', 'MartonBalassa_software_developer.pdf');
    const outputPath = process.env.PDF_OUTPUT_PATH
        ? path.resolve(__dirname, process.env.PDF_OUTPUT_PATH)
        : defaultOutputPath;
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '1cm' },
    });

    await browser.close();
    console.log(`PDF saved to ${outputPath}`);
})();
