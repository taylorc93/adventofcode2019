const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe, curriedMap, curry, chunk, match,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');
const add = (x, y) => x + y;
const multiply = (x, y) => x * y;

const updateIntcode = (position, value, intcode) => [
  ...intcode.slice(0, position),
  value,
  ...intcode.slice(position + 1, intcode.length),
];

const baseOpcode = (fn, [, i, j, position]) => (
  (intcode) => (
    updateIntcode(
      position,
      fn(intcode[i], intcode[j]),
      intcode,
    )
  )
);

const opcode1 = curry(baseOpcode)(add);
const opcode2 = curry(baseOpcode)(multiply);
const opcode99 = () => (intcode) => intcode;

const generateOp = (op) => match(op[0])
  .on((x) => x === 1, () => opcode1(op))
  .on((x) => x === 2, () => opcode2(op))
  .otherwise(() => opcode99(op));

const initializeIntcode = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
);

/*
 * Converts the intcode program from intcode to a "runnable". A runnable is our
 * custom data structure for an intcode program. A runnable is an object with
 * 2 keys:
 *
 * - `intcode`: The raw intcode (same as the intcode passed in)
 * - `ops`: An array of functions that represent the 4 value instructions to
 *          execute (eg: [1, 2, 3, 4]).
 */
const generateRunnable = (intcode) => ({
  intcode,
  ops: pipe(
    curry(chunk)(4),
    curriedMap(generateOp),
  )(intcode),
});

// Because opcode99 will return the same value as it's passed, we can use
// referential equality to break out of the recursion (ie. halt the program)
const performOperations = ({ intcode, ops }) => (
  ops[0](intcode) === intcode
    ? intcode
    : performOperations({
      intcode: ops[0](intcode),
      ops: ops.slice(1),
    })
);

const runProgram = pipe(
  generateRunnable,
  performOperations,
  (intcode) => intcode[0],
);

const main = pipe(
  initializeIntcode,
  curry(updateIntcode)(1, 12),
  curry(updateIntcode)(2, 2),
  runProgram,
);

module.exports = {
  main,
  updateIntcode,
  initializeIntcode,
  runProgram,
};
