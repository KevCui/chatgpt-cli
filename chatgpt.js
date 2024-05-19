#!/usr/bin/env node

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const fs = require('node:fs');
const token = fs.readFileSync(__dirname + '/token').toString().trim();

const searchText = process.argv[2];
const url = 'https://chatgpt.com';
const urlSettings = 'https://chatgpt.com/#settings';
const buttonSubmit = '.mr-1';
const buttonDelete = '.btn-danger';
const toolbar = '.mt-1';
const textareaSearchBox = '#prompt-textarea';
const textMessage = '.text-message';
const totalLoopCount = 60;
const printIntervalTime = 500;

chromium.launch({ headless: true, timeout: 30000 }).then(async browser => {
  // Set context
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: '__Secure-next-auth.session-token',
      value: token,
      url: url,
    }
  ]);
  const page = await context.newPage();

  // Start page
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Submit question
  await page.fill(textareaSearchBox, searchText);
  await page.click(buttonSubmit);

  // Get reply
  for (let i = 0; i < totalLoopCount; i++) {
    await new Promise((resolve) => setTimeout(resolve, printIntervalTime));
    const result = await page.locator(textMessage).last().textContent();
    console.clear();
    console.log('----------\n' + result.replace(/^\s*\n+/gm, '\n'));
    if (await page.locator(toolbar).isVisible()
      && i != (totalLoopCount - 1)){
      i = (totalLoopCount - 1);
    }
  }

  // Delete all chat history
  await page.goto(urlSettings, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);
  await page.click(buttonDelete);
  await page.waitForTimeout(100);
  await page.click(buttonDelete);

  // Close browser
  await browser.close();
});
