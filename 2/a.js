const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap } = require('../utils/functional');

const { generateRunnable, runProgram, updateIntcode } = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeIntcode = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
);

const main = pipe(
  initializeIntcode,
  (intcode) => updateIntcode({ position: 1, value: 12, intcode }),
  (intcode) => updateIntcode({ position: 2, value: 2, intcode }),
  generateRunnable,
  runProgram,
  (runnable) => runnable.intcode[0],
);

module.exports = {
  main,
  initializeIntcode,
};
