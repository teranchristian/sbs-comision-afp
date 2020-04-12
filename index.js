process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

const dotenv = require('dotenv');
const docopt = require('docopt');
const cheerio = require('cheerio');
const msg = require('./lib/msg');
const headless = require('./lib/headless');
const selector = require('./lib/selector');
const helper = require('./lib/helper');

dotenv.config();

const usage = `
Usage:
  start [<period>]
Options:
  perid     el periodo(yyyy-mm) que deseas bajar la comision.
`;

const scraping = async(inputPeriod) => {
  const {browser, page} = await headless.getComisionPage();
  const html = await page.content();
  const data = [];

  const periods = selector.getPeriods(html);
  for (i = 0; i < periods.length; i++) {
    const period = periods[i];

    process.stdout.write("Downloading period : " + period + " - " + (i+1) + "/" + periods.length + "\r");

    const periodPage = await headless.getPageByPeriod(page, period);
    const periodHtml = await periodPage.content();
    const periodData = selector.getDataByPeriod(periodHtml, period);
    data.push(periodData);
  }

  const rawData = helper.formatData(data);
  const flatData = helper.formatFlatData(rawData);

  helper.saveData(rawData, 'raw');
  helper.saveData(flatData, 'flat');
  await headless.end(browser);
};

const options = docopt.docopt(usage);
const period = options['<period>'] || undefined;

scraping(period).then(() => {
  console.log('\n');
  msg.bgGreen('Done!');
  process.exit(0);
}).catch(e => {
  console.log(e);
  process.exit(1);
});
