const path = require('path');

const { readInputFile, splitBy } = require('../utils/readInput');
const {
  pipe, curriedMap, curry, reduce, map,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitBy(''),
  curriedMap(Number),
);


function* getPattern(outputPosition) {
  const pattern = [0, 1, 0, -1];
  let i = 1;

  while (true) {
    yield pattern[Math.floor(i / outputPosition) % 4];
    i += 1;
  }
}

const getOnesDigit = (num) => Math.abs(num % 10);
const getFirstEight = (nums) => Number(nums.slice(0, 8).join(''));

const transformNum = (_, i, input) => {
  const pattern = getPattern(i + 1);

  return getOnesDigit(reduce(
    (sum, n) => sum + n * pattern.next().value,
    0,
    input,
  ));
};

const applyPhases = (numPhases, input) => reduce(
  (nums) => map(transformNum, nums),
  input,
  Array(numPhases).fill(),
);

const main = pipe(
  initializeInput,
  curry(applyPhases)(100),
  getFirstEight,
);

module.exports = {
  main,
  initializeInput,
  getPattern,
};
