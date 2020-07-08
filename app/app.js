'use strict';

const puppeteer = require('puppeteer');
const Dropbox = require('dropbox');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');
const moment = require('moment-timezone');

(async () => {

  process.on('unhandledRejection', (reason, p) => {
    throw reason;
  });

  if (process.argv[2] === undefined) {
    throw 'URL required!';
  }

  const siteUrl = process.argv[2];

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 1024, deviceScalefactor: 1 });

  const tmpPath = `tmp-${crypto.randomBytes(8).toString('hex')}.png`;

  await page.goto(siteUrl);
  await page.waitFor(5000);
  await page.screenshot({ path: tmpPath, fullPage: true });

  // browser.close();

  const dbx = new Dropbox({
    accessToken: 'XXXXX'
  })

  fs.readFile(path.join(__dirname, tmpPath), (err, data) => {
    if (err) {
      throw err;
    }

    const dir = new URL(siteUrl).hostname;
    const filename = moment().tz('Asia/Tokyo').format('YYYY-MM-DD_HH-mm-ss');
    const extname = 'png';

    dbx.filesUpload({ path: `/${dir}/${filename}.${extname}`, contents: data })
      .then((resp) => {
        // console.log(resp);
      })
      .catch((err) => {
        throw err;
      })
      .then(() => {
        fs.unlinkSync(path.join(__dirname, tmpPath));
      });
  });

})();
