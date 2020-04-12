const fs = require('fs');

const AFP = 'afp';
const C_FIJA = 'comision_fija';
const C_SOBRE_FLUJO = 'comision_sobre_flujo';
const C_MIXTA_SOBRE_FLUJO = 'comision_mixta_sobre_flujo';
const C_MIXTA_ANUAL = 'comision_mixta_anual_sobre_saldo';
const PRIMA_SEGURO = 'prima_de_seguro';
const APORTE_OBLIGATORIO = 'aporte_obligatorio_al_fondo_de_pensiones';
const REMUNERACION_MAXIMA = 'remuneracion_maxima_asegurable';

const C_MIXTA_FROM_PERIOD = '2013-02';

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

function isComisionMixta(period) {

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

const formatData = (data) => {
  return data.map((periods) => {
    return Object.keys(periods).reduce((fp, period) => {
      const rows = periods[period];
      fp[period] = formatRows(rows, isComisionMixta(period));
      return fp;
    }, {});
  });
}

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

function saveData(data, name) {
  const d = new Date();
  const date = [
    d.getFullYear(),
    ('0' + (d.getMonth() + 1)).slice(-2),
    ('0' + d.getDate()).slice(-2)
  ].join('-');

  const filename = `./output/${date}-${name}.json`;
  fs.writeFileSync(filename, JSON.stringify(data));
}

module.exports = {
  formatData: formatData,
  formatFlatData: formatFlatData,
  saveData, saveData
}
