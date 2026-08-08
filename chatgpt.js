#!/usr/bin/env node

process.env.CLOAKBROWSER_AUTO_UPDATE = 'false';

const { NodeHtmlMarkdown } = require('node-html-markdown');

const searchText = process.argv[2];
const url = 'https://chatgpt.com/';
const buttonSubmit = '[data-testid="send-button"]';
const buttonStop = '[data-testid="stop-button"]';
const textareaSearchBox = '#prompt-textarea';
const textMessage = '.markdown';
const timer = 500;
const timeout = 30000;

async function main() {
  const { launch } = await import('cloakbrowser');
  const browser = await launch({ headless: true });

  // Set page 
  const page = await browser.newPage();

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

  process.stdout.write('\x1B\[2J\x1B\[3J\x1B\[H');
  const currentHtml = await page.locator(textMessage).innerHTML();
  const markdown = NodeHtmlMarkdown.translate(currentHtml);
  console.log(markdown);

  // Close browser
  await browser.close();
}

main().catch(console.error);
