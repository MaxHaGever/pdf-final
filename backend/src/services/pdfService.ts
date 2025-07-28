import ejs from 'ejs';
import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';

export async function renderPdf({
  docType,
  data,
  header = {},
  optional = {},
}: {
  docType: string;
  data: Record<string, any>;
  header?: Record<string, any>;
  optional?: Record<string, any>;
}): Promise<Buffer> {
  header.date ||= new Date().toISOString();

  let viewsDir = path.resolve(process.cwd(), 'views');
  if (!fs.existsSync(viewsDir)) {
    viewsDir = path.resolve(process.cwd(), 'src', 'views');
  }

  const templateFile = fs.existsSync(path.join(viewsDir, `${docType}.ejs`))
    ? `${docType}.ejs`
    : 'default.ejs';
  const templatePath = path.join(viewsDir, templateFile);

  const html = await ejs.renderFile(
    templatePath,
    { docType, data, header, optional },
    { async: true, views: [viewsDir] }
  );

  const debugPath = path.join(__dirname, '../tests/output/debug.html');
  fs.mkdirSync(path.dirname(debugPath), { recursive: true });
  fs.writeFileSync(debugPath, html, 'utf-8');

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdf);
}