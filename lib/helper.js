const formatData = (data) => {
  return data.map((periods) => {
    return Object.keys(periods).reduce((fp, period) => {
      const rows = periods[period];
      fp[period] = formatRows(rows, isComisionMixta(period));
      return fp;
    }, {});
  });
}

module.exports {
  formatData: formatData
}
