const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe, curriedMap, curry, chunk, match,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');
const add = (x, y) => x + y;
const multiply = (x, y) => x * y;

const updateIntcode = (value, position, intcode) => [
  ...intcode.slice(0, position),
  value,
  ...intcode.slice(position + 1, intcode.length),
];

// eslint-disable-next-line
const convertToInstruction = (fn, [opcode, i, j, position]) => (intcode) => updateIntcode(
  fn(intcode[i], intcode[j]),
  position,
  intcode,
);

const opcode1 = curry(convertToInstruction)(add);
const opcode2 = curry(convertToInstruction)(multiply);
const opcode99 = () => (intcode) => intcode;

const handleOperation = (operation) => match(operation[0])
  .on((x) => x === 1, () => opcode1(operation))
  .on((x) => x === 2, () => opcode2(operation))
  .otherwise(() => opcode99(operation));

const initializeIntcode = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  curry(updateIntcode)(12, 1),
  curry(updateIntcode)(2, 2),
);

const generateInstructions = (intcode) => ({
  intcode,
  ops: pipe(
    curry(chunk)(4),
    curriedMap(handleOperation),
  )(intcode),
});

// Because opcode99 will return the same value as it's passed, we can use
// referential equality to break out of the recursion
const runProgram = ({ intcode, ops }) => ops[0](intcode) === intcode
  ? intcode
  : runProgram({ intcode: ops[0](intcode), ops: ops.slice(1) });

const main = pipe(
  initializeIntcode,
  generateInstructions,
  runProgram,
  (intcode) => intcode[0],
);

module.exports = {
  main,
  updateIntcode,
  initializeIntcode,
  generateInstructions,
  runProgram,
};
