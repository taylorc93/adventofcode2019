const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap } = require('../utils/functional');

const { generateRunnable, runProgram, updateMemory } = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeMemory = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
);

const main = pipe(
  initializeMemory,
  (memory) => updateMemory({ position: 1, value: 12, memory }),
  (memory) => updateMemory({ position: 2, value: 2, memory }),
  generateRunnable,
  runProgram,
  (runnable) => runnable.memory[0],
);

module.exports = {
  main,
  initializeMemory,
};
