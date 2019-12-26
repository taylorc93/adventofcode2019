const {
  match,
  map,
  curry,
  zip,
  pipe,
} = require('./functional');

const updateIntcode = ({ position, value, intcode }) => [
  ...intcode.slice(0, position),
  value,
  ...intcode.slice(position + 1, intcode.length),
];

const generateRunnable = (intcode) => ({
  intcode, // The raw array of integers to be used for the program
  head: 0, // AKA the instruction pointer
  input: null, // Where input values are stored
  output: null, // Where opcode 4 writes to
});

const getParameters = (runnable, numParams) => (
  runnable.intcode.slice(runnable.head + 1, runnable.head + 1 + numParams)
);

const positionMode = (runnable, parameter) => runnable.intcode[parameter];
const immediateMode = (_, parameter) => parameter;
const getValueForMode = (runnable, [mode, parameter]) => match(mode)
  .on((x) => x === '0', () => positionMode(runnable, parameter))
  .on((x) => x === '1', () => immediateMode(runnable, parameter))
  .otherwise(() => { throw new Error(`Unsupported mode ${mode}`); });

const opcode1 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  intcode: updateIntcode({
    position: instruction.parameters[2],
    value: instruction.parameters[1] + instruction.parameters[0],
    intcode: runnable.intcode,
  }),
});
const opcode2 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  intcode: updateIntcode({
    position: instruction.parameters[2],
    value: instruction.parameters[1] * instruction.parameters[0],
    intcode: runnable.intcode,
  }),
});
const opcode3 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 2,
  intcode: updateIntcode({
    position: instruction.parameters[0],
    value: runnable.input[0],
    intcode: runnable.intcode,
  }),
  input: runnable.input.slice(1),
});
const opcode4 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 2,
  output: instruction.parameters[0],
});
const opcode5 = ({ runnable, instruction }) => ({
  ...runnable,
  head: instruction.parameters[0] !== 0
    ? instruction.parameters[1]
    : runnable.head + 3,
});
const opcode6 = ({ runnable, instruction }) => ({
  ...runnable,
  head: instruction.parameters[0] === 0
    ? instruction.parameters[1]
    : runnable.head + 3,
});
const opcode7 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  intcode: updateIntcode({
    position: instruction.parameters[2],
    value: instruction.parameters[0] < instruction.parameters[1] ? 1 : 0,
    intcode: runnable.intcode,
  }),
});
const opcode8 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  intcode: updateIntcode({
    position: instruction.parameters[2],
    value: instruction.parameters[0] === instruction.parameters[1] ? 1 : 0,
    intcode: runnable.intcode,
  }),
});
const opcode99 = ({ runnable }) => runnable;

/*
 * For values who have a parameter indicating where to write a value to, these
 * have mode 1 hard coded for that parameter. This ensures that the parameter
 * will be used as the address, not the value at the address the parameter is
 * pointing to.
 */
const standardizeOpcode1 = (op) => (
  `1${op.slice(0, op.length - 2).padStart(2, '0')}01`
);
const standardizeOpcode2 = (op) => (
  `1${op.slice(0, op.length - 2).padStart(2, '0')}02`
);
const standardizeOpcode3 = () => '103';
const standardizeOpcode4 = () => '004';
const standardizeOpcode5 = (op) => (
  `${op.slice(0, op.length - 2).padStart(2, '0')}05`
);
const standardizeOpcode6 = (op) => (
  `${op.slice(0, op.length - 2).padStart(2, '0')}06`
);
const standardizeOpcode7 = (op) => (
  `1${op.slice(0, op.length - 2).padStart(2, '0')}07`
);
const standardizeOpcode8 = (op) => (
  `1${op.slice(0, op.length - 2).padStart(2, '0')}08`
);

const standardizeOpcode = (op) => match(op.slice(op.length - 2, op.length))
  .on((x) => x === '99', () => '99')
  .on((x) => Number(x) === 1, () => standardizeOpcode1(op))
  .on((x) => Number(x) === 2, () => standardizeOpcode2(op))
  .on((x) => Number(x) === 3, () => standardizeOpcode3(op))
  .on((x) => Number(x) === 4, () => standardizeOpcode4(op))
  .on((x) => Number(x) === 5, () => standardizeOpcode5(op))
  .on((x) => Number(x) === 6, () => standardizeOpcode6(op))
  .on((x) => Number(x) === 7, () => standardizeOpcode7(op))
  .on((x) => Number(x) === 8, () => standardizeOpcode8(op))
  .otherwise((x) => { throw new Error(`Unsupported opcode ${x}`); });

const getOperationForOpcode = (op) => match(op.slice(op.length - 1))
  .on((x) => x === '1', () => opcode1)
  .on((x) => x === '2', () => opcode2)
  .on((x) => x === '3', () => opcode3)
  .on((x) => x === '4', () => opcode4)
  .on((x) => x === '5', () => opcode5)
  .on((x) => x === '6', () => opcode6)
  .on((x) => x === '7', () => opcode7)
  .on((x) => x === '8', () => opcode8)
  .otherwise(() => opcode99);

const setInstruction = pipe(
  (runnable) => ({
    runnable,
    opcode: standardizeOpcode(String(runnable.intcode[runnable.head])),
  }),
  ({ runnable, opcode }) => ({
    runnable,
    opcode,
    modes: opcode.slice(0, opcode.length - 2).split('').reverse(),
  }),
  ({ runnable, opcode, modes }) => ({
    operation: getOperationForOpcode(opcode),
    parameters: map(
      curry(getValueForMode)(runnable),
      zip(modes, getParameters(runnable, modes.length)),
    ),
  }),
);

const runInstruction = pipe(
  (runnable) => ({ runnable, instruction: setInstruction(runnable) }),
  (ri) => ri.instruction.operation(ri),
);

const provideInput = (input, runnable) => ({ ...runnable, input });

const runProgram = (runnable) => match(runInstruction(runnable))
  .on((r) => runnable === r, () => runnable)
  .otherwise((r) => runProgram(r));

module.exports = {
  generateRunnable,
  setInstruction,
  updateIntcode,
  runProgram,
  standardizeOpcode,
  provideInput,
  getOperationForOpcode,
};
