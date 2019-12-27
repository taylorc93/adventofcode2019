const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
  (runnable) => provideInput(runnable, 1),
);

const main = pipe(
  initializeProgram,
  runProgram,
  (runnable) => runnable.output.length === 1
    ? runnable.output[0]
    : runnable.output,
);

module.exports = {
  main,
  initializeProgram,
};
