const puppeteer = require('puppeteer');

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36";

async function start() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  return page;
}

const getComisionPage = async () => {
  const page = await start();
  await page.goto(process.env.BASE_URL, {waitUntil: 'networkidle2'});
  return page;
};

const getPageByPeriod = async (page, period) => {
  await page.select('#cboPeriodo', period);
  page.click('#btnConsultar');

  await page.waitForNavigation({waitUntil: 'load'});
  return page;
}

module.exports = {
  getComisionPage: getComisionPage,
  getPageByPeriod : getPageByPeriod
}
