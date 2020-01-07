const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe, curriedMap, curry, reduce,
} = require('../utils/functional');

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
);

const checkTile = (program, x, y) => (
  Number(runProgram(provideInput(program, x, y)).output[0])
);

const findAffectedTiles = (maxTiles, program) => reduce(
  (total, _, y) => total + reduce(
    (sum, __, x) => sum + checkTile(program, x, y),
    0,
    Array(maxTiles).fill(),
  ),
  0,
  Array(maxTiles).fill(),
);

const main = pipe(
  initializeProgram,
  curry(findAffectedTiles)(50),
);

module.exports = {
  main,
  initializeProgram,
};
