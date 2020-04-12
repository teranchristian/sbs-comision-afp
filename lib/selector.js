const cheerio = require('cheerio');

const getPeriods = (html) => {
  var $ = cheerio.load(html);

  return $("select#cboPeriodo option").map(function() {
    if ($(this).val() != "") {
      return $(this).val();
    }
  }).get();
}

const getDataByPeriod = (html, period) => {
  const $ = cheerio.load(html);
  const data = {
    [period]: []
  };

  $('body > center > table > tbody > tr > td > center  > table .JER_filaContenido').each(function(i, e) {
    const row = [];
    $("td", this).each(function(y, z) {
      row.push($(this).text().trim());
    });
    data[period].push(row);
  });
  return data;
}

module.exports = {
  getPeriods: getPeriods,
  getDataByPeriod: getDataByPeriod
}
