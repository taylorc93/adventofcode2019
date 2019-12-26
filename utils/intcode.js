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

const getParameter = (runnable, offset) => (
  Number(runnable.intcode[runnable.head + offset])
);

const positionMode = (runnable, parameter) => Number(runnable.intcode[parameter]);
const immediateMode = (_, parameter) => parameter;
const getValueForMode = (runnable, [mode, parameter]) => match(mode)
  .on((x) => x === '0', () => positionMode(runnable, parameter))
  .on((x) => x === '1', () => immediateMode(runnable, parameter))
  .otherwise(() => { throw new Error(`Unsupported mode ${mode}`); });

const opcode1 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  intcode: updateIntcode({
    position: instruction[3],
    value: instruction[2] + instruction[1],
    intcode: runnable.intcode,
  }),
});
const opcode2 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  intcode: updateIntcode({
    position: instruction[3],
    value: instruction[2] * instruction[1],
    intcode: runnable.intcode,
  }),
});
const opcode3 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 2,
  intcode: updateIntcode({
    position: instruction[1],
    value: runnable.input,
    intcode: runnable.intcode,
  }),
});
const opcode4 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 2,
  output: instruction[1],
});
const opcode99 = ({ runnable }) => runnable;

// Helper to ensure all opcodes have a parameter mode set for each parameter
const standardizeOpcode = (opcode) => match(String(opcode))
  // Handle single digit cases first
  .on((x) => x === '1', () => '00001')
  .on((x) => x === '2', () => '00002')
  .on((x) => x === '99', () => '99')
  // With opcodes 3 + 4, the write instruction is always 0, so these can be
  // standardized to 003 or 004 respectively
  .on(
    (x) => x[x.length - 1] === '3' || x[x.length - 1] === '4',
    (x) => `00${x[x.length - 1]}`,
  )
  // For opcode 1 + 2 with parameter modes set, this pads any missing parameters
  // with '0' (eg. '1001' => '01001')
  .on(
    (x) => x[x.length - 1] === '1' || x[x.length - 1] === '2',
    (x) => `${x.slice(0, x.length - 1)}${x[x.length - 1]}`.padStart(5, '0'),
  )
  .otherwise((x) => { throw new Error(`Unsupported opcode ${x}`); });

const executeInstruction = ({ runnable, instruction }) => match(instruction[0])
  .on(
    (x) => x.slice(x.length - 1) === '1',
    () => opcode1({ runnable, instruction }),
  )
  .on(
    (x) => x.slice(x.length - 1) === '2',
    () => opcode2({ runnable, instruction }),
  )
  .on(
    (x) => x.slice(x.length - 1) === '3',
    () => opcode3({ runnable, instruction }),
  )
  .on(
    (x) => x.slice(x.length - 1) === '4',
    () => opcode4({ runnable, instruction }),
  )
  .otherwise(() => opcode99({ runnable }));

const setInstruction = (runnable) => {
  const opcode = standardizeOpcode(runnable.intcode[runnable.head]);
  if (opcode === '99') {
    return [opcode];
  }

  const modes = opcode
    .slice(0, opcode.length - 2)
    .split('')
    .reverse();
  const parameters = runnable
    .intcode
    .slice(runnable.head + 1, runnable.head + 1 + modes.length);

  const values = map(curry(getValueForMode)(runnable), zip(modes, parameters));
  return [
    opcode,
    ...values.slice(0, values.length - 1),
    Number(opcode) === 4
      ? values[0]
      : getParameter(runnable, modes.length),
  ];
};

const runInstruction = pipe(
  (runnable) => ({ runnable, instruction: setInstruction(runnable) }),
  executeInstruction,
);

const provideInput = (input, runnable) => ({ ...runnable, input });

const generateRunnable = (intcode) => ({
  intcode,
  head: 0, // AKA the instruction pointer
  input: null,
  output: null,
  currentInstruction: null,
});

const runProgram = (runnable) => {
  const newRunnable = runInstruction(runnable);

  return runnable === newRunnable
    ? runnable
    : runProgram(newRunnable);
};

module.exports = {
  generateRunnable,
  setInstruction,
  updateIntcode,
  runProgram,
  standardizeOpcode,
  provideInput,
};
