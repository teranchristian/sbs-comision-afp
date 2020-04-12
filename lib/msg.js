module.exports = {
  bgRed: function bgRed(msg) {
    console.log('\x1b[41m%s\x1b[0m', msg);
  },
  bgYellow: function bgYellow(msg) {
    console.log('\x1b[103m%s\x1b[0m', msg);
  },
  bgGreen: function bgGreen(msg) {
    console.log('\x1b[42m%s\x1b[0m', msg);
  },
  grey: function grey(msg) {
    console.log('\x1b[90m%s\x1b[0m', msg);
  },
  yellow: function yellow(msg) {
    console.log('\x1b[33m%s\x1b[0m', msg);
  },
  green: function green(msg) {
    console.log('\x1b[32m%s\x1b[0m', msg);
  },
  blue: function blue(msg) {
    console.log('\x1b[34m%s\x1b[0m', msg);
  }
};
