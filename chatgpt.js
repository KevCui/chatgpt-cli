#!/usr/bin/env node

const { chromium } = require('playwright-extra');
const { NodeHtmlMarkdown } = require('node-html-markdown');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const searchText = process.argv[2];
const url = 'https://chatgpt.com/?hints=search';
const buttonSubmit = '[data-testid="send-button"]';
const buttonStop = '[data-testid="stop-button"]';
const textareaSearchBox = '#prompt-textarea';
const textMessage = '.markdown';
const timer = 500;
const timeout = 30000;

chromium.launch({ headless: false, timeout: timeout }).then(async browser => {
  // Set page 
  const context = await browser.newContext({});
  const page = await context.newPage();

  // Start page
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Submit question
  await page.fill(textareaSearchBox, searchText);
  await page.click(buttonSubmit);

  // Get reply
  let previousHtml = '';
  const stop = page.locator(buttonStop);
  while (await stop.count() > 0) {
      await page.waitForTimeout(timer);
      await page.waitForSelector(textMessage, { timeout: timeout });
      const currentHtml = await page.locator(textMessage).innerHTML();
      if (currentHtml !== previousHtml) {
        process.stdout.write('\x1B\[2J\x1B\[3J\x1B\[H');
        const markdown = NodeHtmlMarkdown.translate(currentHtml);
        console.log(markdown || '(empty)');
        previousHtml = currentHtml;
      }
  }

  // Close browser
  await browser.close();
});
