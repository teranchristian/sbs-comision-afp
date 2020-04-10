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

  const periodos = $("select#cboPeriodo option").map(function() {
    if ($(this).val() != "") {
      return $(this).val();
    }
  }).get();


  const data = [];
  for (i = 0; i < 3; i++) {
    const periodo = periodos[i];
    console.log(periodo);
    await page.select('#cboPeriodo', periodo);
    page.click('#btnConsultar');

    await page.waitForNavigation({waitUntil: 'load'});

    const html1 = await page.content();
    $ = cheerio.load(html1);

    data.push(getPeriodoData(periodo, $));
  }

  console.log(data);
  console.log(JSON.stringify(formatData(data)));
  await browser.close();
})();

function getPeriodoData(periodo, $) {
  const data = {};
  data[periodo] = [];
  $('body > center > table > tbody > tr > td > center:nth-child(2) > table .JER_filaContenido').each(function(i, e) {
    const row = [];
    $("td", this).each(function(y, z) {
      row.push($(this).text().trim());
    });
    data[periodo].push(row);
  });
  return data;
}


function formatData(data) {
  return data.map((period) => {
      return Object.keys(period).reduce((fp, date) => {
        const rows = period[date];
        const fRow = rows.reduce((f, row) => {
            console.log('date', date, 'row', row.length);
           f.push({
              afp: row[0],
              'comision fija': row[1],
              'comision sobre flujo': row[2],
              'prima de seguro': row[3],
              'aporte obligatorio al fondo de pensiones': row[4],
              'remuneracion maxima asegurable': row[5]
           });
          return f;
        }, []);

        fp[date] =fRow
        return fp;
      }, {});
  });
}
