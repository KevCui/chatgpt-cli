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

async function main() {
  const { launch } = await import('cloakbrowser');
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  console.log("Connecting site...")
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  console.log("Sending prompt...")
  await page.fill(textareaSearchBox, searchText, { timeout: 5000 });
  await page.click(buttonSubmit);

  console.log("Receiving response...")
  let previousHtml = '';
  const stop = page.locator(buttonStop);
  while (await stop.count() > 0) {
      await page.waitForTimeout(timer);
      await page.waitForSelector(textMessage, { timeout: 30000 });
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

  await browser.close();
}

main().catch(console.error);
