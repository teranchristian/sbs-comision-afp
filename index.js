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
  start [--dry-run] [<pubId>]
Options:
  --dry-run     print changes to console only, do no modify placements
`;

(async () => {
});

function formatFlatData(data) {
  let flat = [];

  data.forEach(d => {
    Object.keys(d).forEach(e => {
      const periodData = d[e];
      const da = periodData.map(p => {
        p.periodo = e;
        return p;
      });
      flat = flat.concat(da);
    });
  });

  return flat;
}

function isComisionMixta(period) {
  const C_MIXTA_FROM_PERIOD = '2013-02';

  const [c_mixta_year, c_mixta_month] = C_MIXTA_FROM_PERIOD.split('-');
  const [p_year, p_month] = period.split('-');

  const mDate = new Date(c_mixta_year, c_mixta_month);
  const pDate = new Date(p_year, p_month);

  return pDate.getTime() >= mDate.getTime();
}

function formatRows(rows, isComisionMixta) {
  return rows.reduce((f, row) => {
    const formatRow = isComisionMixta ? headerMixta(row) : headerNoMixta(row);
    f.push(formatRow);
    return f;
  }, []);
}
const AFP = 'afp';
const C_FIJA = 'comision_fija';
const C_SOBRE_FLUJO = 'comision_sobre_flujo';
const C_MIXTA_SOBRE_FLUJO = 'comision_mixta_sobre_flujo';
const C_MIXTA_ANUAL = 'comision_mixta_anual_sobre_saldo';
const PRIMA_SEGURO = 'prima_de_seguro';
const APORTE_OBLIGATORIO = 'aporte_obligatorio_al_fondo_de_pensiones';
const REMUNERACION_MAXIMA = 'remuneracion_maxima_asegurable';

function headerMixta(row) {
  return {
    [AFP]: row[0],
    [C_FIJA]: row[1],
    [C_SOBRE_FLUJO]: row[2],
    [C_MIXTA_SOBRE_FLUJO]: row[3],
    [C_MIXTA_ANUAL]: row[4],
    [PRIMA_SEGURO]: row[5],
    [APORTE_OBLIGATORIO]: row[6],
    [REMUNERACION_MAXIMA]: row[7]
  }
}

function headerNoMixta(row) {
  return {
    [AFP]: row[0],
    [C_FIJA]: row[1],
    [C_SOBRE_FLUJO]: row[2],
    [PRIMA_SEGURO]: row[3],
    [APORTE_OBLIGATORIO]: row[4],
    [REMUNERACION_MAXIMA]: row[5]
  }
}

const scraping = async(pubId, dryRun) => {
  const page = await headless.getComisionPage();
  const html = await page.content();

  const periods = selector.getPeriods(html);
  console.log(periods);

  const data = [];
  for (i = 0; i < periods.length; i++) {

    const period = periods[i];
    const periodPage = await headless.getPageByPeriod(page, period);
    const periodHtml = await periodPage.content();
    const periodData = selector.getDataByPeriod(periodHtml, period);

    data.push(periodData);
  }

  data = helper.formatData(data);

  const colab = formatFlatData(data);
  console.log(JSON.stringify(colab));
  // await browser.close();
};

const options = docopt.docopt(usage);
const pubId = options['<pubId>'] || undefined;
dryRun = options['--dry-run'] || false;

scraping(pubId, dryRun).then(() => {
  msg.bgGreen('Done!');
  process.exit(0);
}).catch(e => {
  console.log(e);
  process.exit(1);
});
