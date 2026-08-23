#!/usr/bin/env node

process.env.CLOAKBROWSER_AUTO_UPDATE = 'false';

const { NodeHtmlMarkdown } = require('node-html-markdown');
const { devices } = require('playwright-core');

const url = 'https://chatgpt.com/?q=' + process.argv[2];
const buttonStop = '.wm-composer-stopIcon .wm-composer-icon';
const textMessage = '._wdUoQG_assistantMessage ._wdUoQG_messageCopy';
const timer = 500;

async function main() {
  console.log("Preparing browser...");
  const { launch } = await import('cloakbrowser');
  const browser = await launch({ headless: true });
  const iPhone15 = devices['iPhone 15'];
  let context = await browser.newContext({ ...iPhone15 });
  let page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await context.close();

  console.log("Connecting site...");
  context = await browser.newContext({ ...iPhone15 });
  page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  console.log("Receiving response...\n\n");
  await page.waitForTimeout(timer);
  while (await page.locator(buttonStop).isVisible()) {
      await page.waitForTimeout(timer);
  }

  const currentHtml = await page.locator(textMessage).innerHTML();
  const markdown = NodeHtmlMarkdown.translate(currentHtml);
  console.log(markdown);

  await browser.close();
}

main().catch(console.error);
