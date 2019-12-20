const fs = require('fs');

/*
 * Helper function to read in an input file as utf8 and split it into an array
 */
const readInput = (path) => fs
  .readFileSync(path, { encoding: 'utf8'})
  .split('\n');

module.exports = readInput;
