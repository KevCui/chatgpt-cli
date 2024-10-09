#!/usr/bin/env node

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const searchText = process.argv[2];
const url = 'https://chatgpt.com';
const buttonSubmit = '[data-testid="send-button"]';
const textareaSearchBox = '#prompt-textarea';
const textMessage = '.markdown';
const totalLoopCount = 60;
const printIntervalTime = 500;

chromium.launch({ headless: true, timeout: 30000 }).then(async browser => {
  // Set page 
  const page = await browser.newPage();

  // Start page
  await page.goto(url, { waitUntil: 'domcontentloaded' });

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
    if (prevResult == result && i != (totalLoopCount - 1)) {
      i = (totalLoopCount - 1);
    }
    prevResult = result
  }

  // Close browser
  await browser.close();
});
