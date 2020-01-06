const { initializeInput, getFirstEight, getOnesDigit } = require('./a');
const { pipe, reduce, curry } = require('../utils/functional');

const repeatInput = (input) => reduce(
  (signal) => {
    signal.push(...input); // using [...signal, ...input] was prohibitively slow
    return signal;
  },
  [],
  Array(10000).fill(),
);

const getFirstSeven = (nums) => Number(nums.slice(0, 7).join(''));

// This implementation presumes that the offset is >= N / 2, where N is the
// length of the input
const transformNums = (input) => {
  const last = input.length - 1;
  const values = [input[last]];
  let i = 1;

  while (i < input.length) {
    values.push(getOnesDigit(values[i - 1] + input[last - i]));
    i += 1;
  }

  return values.reverse();
};

const applyPhasesWithOffset = (numPhases, { input }) => reduce(
  transformNums,
  input,
  Array(numPhases).fill(),
);

const main = pipe(
  initializeInput,
  repeatInput,
  (input) => ({
    input: input.slice(getFirstSeven(input)),
    offset: getFirstSeven(input),
  }),
  curry(applyPhasesWithOffset)(100),
  getFirstEight,
);

module.exports = {
  main,
};
