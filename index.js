const request = require('request');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const BASE_URL = "https://www.sbs.gob.pe/app/spp/empleadores/comisiones_spp/Paginas/comision_prima.aspx";
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.goto(BASE_URL, {waitUntil: 'networkidle2'});
  const html = await page.content();
  var $ = cheerio.load(html);

  const periods = $("select#cboPeriodo option").map(function() {
    if ($(this).val() != "") {
      return $(this).val();
    }
  }).get();

  let data = [];
  for (i = 0; i < periods.length; i++) {

    const period = periods[i];

    await page.select('#cboPeriodo', period);
    page.click('#btnConsultar');

    await page.waitForNavigation({waitUntil: 'load'});

    const html1 = await page.content();
    $ = cheerio.load(html1);

    data.push(getPeriodoData(period, $));
  }


  data = formatData(data);
  const colab = formatFlatData(data);
  console.log(JSON.stringify(colab));
  await browser.close();
})();

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

function getPeriodoData(periodo, $) {
  const data = {};
  data[periodo] = [];
  $('body > center > table > tbody > tr > td > center  > table .JER_filaContenido').each(function(i, e) {
    const row = [];
    $("td", this).each(function(y, z) {
      row.push($(this).text().trim());
    });
    data[periodo].push(row);
  });
  return data;
}

function formatData(data) {
  return data.map((periods) => {
    return Object.keys(periods).reduce((fp, period) => {
      const rows = periods[period];
      fp[period] = formatRows(rows, isComisionMixta(period));
      return fp;
    }, {});
  });
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
