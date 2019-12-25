const {
  initializeInput,
  doesNotDecrease,
  findPossiblePasswords,
} = require('./a');

const {
  pipe, filter, reduce, match, curry,
} = require('../utils/functional');


const hasAdjacentPair = (num, i) => match(num.length)
  .on((x) => x === 2, () => num[0] === i && num[0] === num[1])
  .otherwise(() => (
    (num[0] === i && num[0] === num[1]) || hasAdjacentPair(num.slice(1), i)
  ));

// 1. Find all numbers that present exactly twice
// 2. Check if the number before or after is the same
const notInLargerGroup = (num) => reduce(
  (found, i) => found || hasAdjacentPair(num, i),
  false,
  // If there are exactly 2 instances of `i` in `num`, split should return a
  // 3 element array (2 strings from where it was split and the rest)
  filter((i) => num.split(i).length === 3, num.split('')),
);

const isValidPassword = (num) => doesNotDecrease(num) && notInLargerGroup(num);

const main = pipe(
  initializeInput,
  curry(findPossiblePasswords)(isValidPassword),
  (passwords) => passwords.length,
);

module.exports = {
  main,
  notInLargerGroup,
};
