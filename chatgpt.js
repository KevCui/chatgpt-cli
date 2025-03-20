#!/usr/bin/env node

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const searchText = process.argv[2];
const turnSearchOn = process.argv[3];
const url = 'https://chatgpt.com';
const buttonSubmit = '[data-testid="send-button"]';
const buttonSearch= '[aria-label="Search"]';
const textareaSearchBox = '#prompt-textarea';
const textMessage = '.markdown';
const totalLoopCount = 60;
const printIntervalTime = 1000;

chromium.launch({ headless: false, timeout: 30000 }).then(async browser => {
  // Set page 
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });

  // Start page
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Enable Search
  if (turnSearchOn) {
    await page.click(buttonSearch);
  }
    
  // Submit question
  await page.fill(textareaSearchBox, searchText);
  await page.click(buttonSubmit);

  // Get reply
  var prevResult = '';
  for (let i = 0; i < totalLoopCount; i++) {
    await new Promise((resolve) => setTimeout(resolve, printIntervalTime));
    const result = await page.locator(textMessage).innerText();
    console.clear();
    console.log('----------\n' + result.replace(/^\s*\n+/gm, '\n'));
    if (prevResult.length > 1 && prevResult == result && i != (totalLoopCount - 1)) {
      i = (totalLoopCount - 1);
    }
    prevResult = result
  }

  // Close browser
  await browser.close();
});
