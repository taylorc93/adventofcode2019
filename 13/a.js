const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap, filter } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

const main = pipe(
  initializeProgram,
  runProgram,
  (runnable) => filter((x, i) => i % 3 === 2 && x === 2, runnable.output),
  (blocks) => blocks.length,
);

module.exports = {
  main,
  initializeProgram,
};
