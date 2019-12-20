const fs = require('fs');

/*
 * Helper function to read in an input file as utf8
 */
const readInputFile = (path) => fs.readFileSync(path, { encoding: 'utf8' })

const splitBy = (delimiter) => (input) => input.split(delimiter);
const splitByNewline = splitBy('\n');
const splitByComma = splitBy(',');

module.exports = {
  readInputFile,
  splitBy,
  splitByComma,
  splitByNewline,
};
