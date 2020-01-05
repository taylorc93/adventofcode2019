const { pipe } = require('./functional');

const updateMemory = ({ position, value, memory }) => {
  // This is a performance optimization that requires less cloning + slicing
  // for cases when we do not need to allocate more memory.
  if (position < memory.length) {
    const clonedMemory = memory.slice(0);
    clonedMemory[position] = value;
    return clonedMemory;
  }

  return [
    ...memory.slice(0, position),
    ...(Array(position - memory.length).fill(0)),
    value,
  ];
};


const statuses = {
  READY: 'R',
  NEEDS_INPUT: 'NI',
  FINISHED: 'F',
};
const generateRunnable = (memory) => ({
  memory, // The raw array of integers to be used for the program
  head: 0, // AKA the instruction pointer
  relative: 0, // The relative base used in relative mode
  input: [], // Where input values are stored
  output: [], // Where opcode 4 writes to
  status: statuses.READY, // The status of the program
});

const getValueInMemory = (runnable, offset) => (
  runnable.memory[runnable.head + offset]
);

// If a parameter is used for a write location (eg. the 3rd parameter in opcode
// 1), we need to handle it's differently
const positionMode = (runnable, parameter, write) => write
  ? parameter
  : runnable.memory[parameter] || 0;
const immediateMode = (_, parameter) => parameter || 0;
const relativeMode = (runnable, parameter, write) => write
  ? runnable.relative + parameter
  : runnable.memory[runnable.relative + parameter] || 0;

const modeHandlers = {
  0: positionMode,
  1: immediateMode,
  2: relativeMode,
};
const getValueForMode = (runnable, mode, parameter, write = false) => (
  modeHandlers[mode](runnable, parameter, write)
);

const opcode1 = ({ runnable, parameters }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: parameters[2],
    value: parameters[1] + parameters[0],
    memory: runnable.memory,
  }),
});
const opcode2 = ({ runnable, parameters }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: parameters[2],
    value: parameters[1] * parameters[0],
    memory: runnable.memory,
  }),
});
const opcode3 = ({ runnable, parameters }) => (
  runnable.input.length > 0
    ? {
      ...runnable,
      head: runnable.head + 2,
      memory: updateMemory({
        position: parameters[0],
        value: runnable.input[0],
        memory: runnable.memory,
      }),
      input: runnable.input.slice(1),
      status: statuses.READY,
    } : {
      ...runnable,
      status: statuses.NEEDS_INPUT,
    }
);
const opcode4 = ({ runnable, parameters }) => ({
  ...runnable,
  head: runnable.head + 2,
  output: [...runnable.output, parameters[0]],
});
const opcode5 = ({ runnable, parameters }) => ({
  ...runnable,
  head: parameters[0] !== 0
    ? parameters[1]
    : runnable.head + 3,
});
const opcode6 = ({ runnable, parameters }) => ({
  ...runnable,
  head: parameters[0] === 0
    ? parameters[1]
    : runnable.head + 3,
});
const opcode7 = ({ runnable, parameters }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: parameters[2],
    value: parameters[0] < parameters[1] ? 1 : 0,
    memory: runnable.memory,
  }),
});
const opcode8 = ({ runnable, parameters }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: parameters[2],
    value: parameters[0] === parameters[1] ? 1 : 0,
    memory: runnable.memory,
  }),
});
const opcode9 = ({ runnable, parameters }) => ({
  ...runnable,
  head: runnable.head + 2,
  relative: runnable.relative + parameters[0],
});
const opcode99 = ({ runnable }) => ({
  ...runnable,
  status: statuses.FINISHED,
});

const getOpcodeId = (op) => op.slice(op.length - 2, op.length);
const getOpcodeModes = (op) => op.slice(0, op.length - 2).split('').reverse();
const setOpcodeModes = (op, numParams) => (
  `${op.slice(0, op.length - 2).padStart(numParams, '0')}`
);

const opcodeFuncs = {
  1: (opcode) => `${setOpcodeModes(opcode, 3)}01`,
  2: (opcode) => `${setOpcodeModes(opcode, 3)}02`,
  3: (opcode) => `${setOpcodeModes(opcode, 1)}03`,
  4: (opcode) => `${setOpcodeModes(opcode, 1)}04`,
  5: (opcode) => `${setOpcodeModes(opcode, 2)}05`,
  6: (opcode) => `${setOpcodeModes(opcode, 2)}06`,
  7: (opcode) => `${setOpcodeModes(opcode, 3)}07`,
  8: (opcode) => `${setOpcodeModes(opcode, 3)}08`,
  9: (opcode) => `${setOpcodeModes(opcode, 1)}09`,
  99: () => '99',
};
const standardizeOpcode = (op) => opcodeFuncs[Number(getOpcodeId(op))](op);

const getOpcode1Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
  getValueForMode(runnable, modes[1], getValueInMemory(runnable, 2)),
  getValueForMode(runnable, modes[2], getValueInMemory(runnable, 3), true),
];
const getOpcode2Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
  getValueForMode(runnable, modes[1], getValueInMemory(runnable, 2)),
  getValueForMode(runnable, modes[2], getValueInMemory(runnable, 3), true),
];
const getOpcode3Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1), true),
];
const getOpcode4Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
];
const getOpcode5Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
  getValueForMode(runnable, modes[1], getValueInMemory(runnable, 2)),
];
const getOpcode6Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
  getValueForMode(runnable, modes[1], getValueInMemory(runnable, 2)),
];
const getOpcode7Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
  getValueForMode(runnable, modes[1], getValueInMemory(runnable, 2)),
  getValueForMode(runnable, modes[2], getValueInMemory(runnable, 3), true),
];
const getOpcode8Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
  getValueForMode(runnable, modes[1], getValueInMemory(runnable, 2)),
  getValueForMode(runnable, modes[2], getValueInMemory(runnable, 3), true),
];
const getOpcode9Parameters = (runnable, modes) => [
  getValueForMode(runnable, modes[0], getValueInMemory(runnable, 1)),
];

const instructions = {
  '01': (runnable, modes) => ({
    operation: opcode1,
    parameters: getOpcode1Parameters(runnable, modes),
  }),
  '02': (runnable, modes) => ({
    operation: opcode2,
    parameters: getOpcode2Parameters(runnable, modes),
  }),
  '03': (runnable, modes) => ({
    operation: opcode3,
    parameters: getOpcode3Parameters(runnable, modes),
  }),
  '04': (runnable, modes) => ({
    operation: opcode4,
    parameters: getOpcode4Parameters(runnable, modes),
  }),
  '05': (runnable, modes) => ({
    operation: opcode5,
    parameters: getOpcode5Parameters(runnable, modes),
  }),
  '06': (runnable, modes) => ({
    operation: opcode6,
    parameters: getOpcode6Parameters(runnable, modes),
  }),
  '07': (runnable, modes) => ({
    operation: opcode7,
    parameters: getOpcode7Parameters(runnable, modes),
  }),
  '08': (runnable, modes) => ({
    operation: opcode8,
    parameters: getOpcode8Parameters(runnable, modes),
  }),
  '09': (runnable, modes) => ({
    operation: opcode9,
    parameters: getOpcode9Parameters(runnable, modes),
  }),
  99: () => ({ operation: opcode99, parameters: [] }),
};
const getInstruction = (runnable) => {
  const opcode = standardizeOpcode(String(getValueInMemory(runnable, 0)));

  return instructions[getOpcodeId(opcode)](runnable, getOpcodeModes(opcode));
};

const runNextInstruction = pipe(
  (runnable) => ({ runnable, ...getInstruction(runnable) }),
  ({ runnable, operation, parameters }) => operation({
    runnable,
    parameters,
  }),
);

const provideInput = (runnable, ...input) => ({
  ...runnable,
  input: runnable.input.length
    ? [...runnable.input, ...input]
    : input,
});

const resetOutput = (runnable) => ({ ...runnable, output: [] });

// The original implementation of `runProgram` used recursion but ran into stack
// overflow errors on larger intcode programs (eg. 9b).
const runProgram = (runnable) => {
  let current = runnable;
  while (current) {
    current = runNextInstruction(current);
    if (current.status === statuses.FINISHED
      || current.status === statuses.NEEDS_INPUT) {
      break;
    }
  }

  return current;
};

module.exports = {
  generateRunnable,
  updateMemory,
  runProgram,
  standardizeOpcode,
  provideInput,
  resetOutput,
  statuses,
};
