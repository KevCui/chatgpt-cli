#!/usr/bin/env node

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const searchText = process.argv[2];
const url = 'https://chatgpt.com/?hints=search';
const buttonSubmit = '[data-testid="send-button"]';
const buttonStop = '[data-testid="stop-button"]';
const textareaSearchBox = '#prompt-textarea';
const textMessage = '.markdown';

chromium.launch({ headless: true, timeout: 30000 }).then(async browser => {
  // Set page 
  const context = await browser.newContext({});
  const page = await context.newPage();

  // Start page
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Submit question
  await page.fill(textareaSearchBox, searchText);
  await page.click(buttonSubmit);

  // Get reply
  await page.waitForTimeout(1000); 
  const stop = page.locator(buttonStop);
  while (await stop.count() > 0) {
    const result = await page.locator(textMessage).allInnerTexts();
    const resultStr = result.toString();
    console.clear();
    console.log('----------\n' + resultStr);
  }

  // Close browser
  await browser.close();
});
