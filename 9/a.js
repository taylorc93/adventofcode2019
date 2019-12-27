const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'test_input.txt');

const initializeIntcode = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
);

const main = pipe(
  initializeIntcode,
  generateRunnable,
  runProgram,
  (runnable) => runnable.output.length === 1
    ? runnable.output[0]
    : new Error(`Too much output: ${JSON.stringify(runnable.output)}`),
);

module.exports = {
  main,
  initializeIntcode,
};
