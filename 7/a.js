const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe,
  curriedMap,
  reduce,
  match,
} = require('../utils/functional');

const { generateRunnable, runProgram, provideInput } = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeRunnable = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

// https://stackoverflow.com/a/56847118/2077250
const rotations = ([l, ...ls], right = []) => l !== undefined
  ? [[l, ...ls, ...right], ...rotations(ls, [...right, l])]
  : [];

const getAllPermutations = ([x, ...xs]) => x !== undefined
  ? getAllPermutations(xs).flatMap((p) => rotations([x, ...p]))
  : [[]];

const runAndGetOutput = pipe(
  runProgram,
  (runnable) => runnable.output,
);

const testPhaseSettings = (runnable, settings) => reduce(
  (output, s) => runAndGetOutput(provideInput(runnable, s, output)),
  0,
  settings,
);

const findMaximumSignal = ({ runnable, permutations }) => reduce(
  (max, settings) => match(testPhaseSettings(runnable, settings))
    .on((x) => !max || x > max, (x) => x)
    .otherwise(() => max),
  null,
  permutations,
);

const main = pipe(
  initializeRunnable,
  (runnable) => ({
    runnable,
    permutations: getAllPermutations([0, 1, 2, 3, 4]),
  }),
  findMaximumSignal,
);

module.exports = {
  main,
  getAllPermutations,
  findMaximumSignal,
  initializeRunnable,
  testPhaseSettings,
};
