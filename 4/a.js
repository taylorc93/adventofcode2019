const path = require('path');
const { readInputFile, splitByDash } = require('../utils/readInput');
const {
  pipe, map, reduce, match, curry,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const hasAdjacentPair = (num) => match(num.length)
  .on((x) => x === 2, () => num[0] === num[1])
  .on(() => num[0] === num[1], () => true)
  .otherwise(() => hasAdjacentPair(num.slice(1)));

const doesNotDecrease = (num) => match(num.length)
  .on((x) => x === 2, () => num[0] <= num[1])
  .on(() => num[0] > num[1], () => false)
  .otherwise(() => doesNotDecrease(num.slice(1)));

const isValidPassword = (num) => hasAdjacentPair(num) && doesNotDecrease(num);

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByDash,
  curry(map)(Number),
);

const findPossiblePasswords = ([min, max]) => reduce(
  (passwords, _, i) => (
    isValidPassword(String(i + min))
      ? [...passwords, String(i + min)]
      : passwords
  ),
  [],
  Array(max - min).fill(),
);

const main = pipe(
  initializeInput,
  findPossiblePasswords,
);

module.exports = {
  main,
};
