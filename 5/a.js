const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap, curry } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeIntcode = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
);

const main = pipe(
  initializeIntcode,
  generateRunnable,
  curry(provideInput)(1),
  runProgram,
  (runnable) => runnable.output,
);

module.exports = {
  main,
  initializeIntcode,
};
