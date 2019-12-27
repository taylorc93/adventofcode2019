const {
  match,
  map,
  curry,
  zip,
  pipe,
} = require('./functional');

const updateMemory = ({ position, value, memory }) => [
  ...memory.slice(0, position),
  value,
  ...memory.slice(position + 1, memory.length),
];

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

const getParameters = (runnable, numParams) => (
  runnable.memory.slice(runnable.head + 1, runnable.head + 1 + numParams)
);

const positionMode = (runnable, parameter) => runnable.memory[parameter];
const immediateMode = (_, parameter) => parameter;
const relativeMode = (runnable, parameter) => runnable.memory[
  runnable.relative + parameter
];
const getValueForMode = (runnable, [mode, parameter]) => match(mode)
  .on((x) => x === '0', () => positionMode(runnable, parameter))
  .on((x) => x === '1', () => immediateMode(runnable, parameter))
  .on((x) => x === '2', () => relativeMode(runnable, parameter))
  .otherwise(() => { throw new Error(`Unsupported mode ${mode}`); });

const opcode1 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: instruction.parameters[2],
    value: instruction.parameters[1] + instruction.parameters[0],
    memory: runnable.memory,
  }),
});
const opcode2 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: instruction.parameters[2],
    value: instruction.parameters[1] * instruction.parameters[0],
    memory: runnable.memory,
  }),
});
const opcode3 = ({ runnable, instruction }) => runnable.input.length > 0
  ? {
    ...runnable,
    head: runnable.head + 2,
    memory: updateMemory({
      position: instruction.parameters[0],
      value: runnable.input[0],
      memory: runnable.memory,
    }),
    input: runnable.input.slice(1),
    status: statuses.READY,
  } : {
    ...runnable,
    status: statuses.NEEDS_INPUT,
  };
const opcode4 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 2,
  output: [...runnable.output, instruction.parameters[0]],
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
  memory: updateMemory({
    position: instruction.parameters[2],
    value: instruction.parameters[0] < instruction.parameters[1] ? 1 : 0,
    memory: runnable.memory,
  }),
});
const opcode8 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 4,
  memory: updateMemory({
    position: instruction.parameters[2],
    value: instruction.parameters[0] === instruction.parameters[1] ? 1 : 0,
    memory: runnable.memory,
  }),
});
const opcode9 = ({ runnable, instruction }) => ({
  ...runnable,
  head: runnable.head + 2,
  relative: runnable.relative + instruction.parameters[0],
});
const opcode99 = ({ runnable }) => ({
  ...runnable,
  status: statuses.FINISHED,
});

/*
 * Params that handle where an instruction should write to should never be in
 * position mode. If there was no mode provided, default to immediate mode.
 */
const handleWriteModeParam = (op) => (
  `${op[0] === '0' ? '1' : op[0]}${op.slice(1)}`
);
const getModes = (op, numParams) => (
  `${op.slice(0, op.length - 2).padStart(numParams, '0')}`
);
const standardizeOpcode1 = (op) => handleWriteModeParam(`${getModes(op, 3)}01`);
const standardizeOpcode2 = (op) => handleWriteModeParam(`${getModes(op, 3)}02`);
const standardizeOpcode3 = (op) => handleWriteModeParam(`${getModes(op, 1)}03`);
const standardizeOpcode4 = (op) => `${getModes(op, 1)}04`;
const standardizeOpcode5 = (op) => `${getModes(op, 2)}05`;
const standardizeOpcode6 = (op) => `${getModes(op, 2)}06`;
const standardizeOpcode7 = (op) => handleWriteModeParam(`${getModes(op, 3)}07`);
const standardizeOpcode8 = (op) => handleWriteModeParam(`${getModes(op, 3)}08`);
const standardizeOpcode9 = (op) => `${getModes(op, 1)}09`;

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
  .on((x) => Number(x) === 9, () => standardizeOpcode9(op))
  .otherwise((x) => { throw new Error(`Unsupported opcode ${x}`); });

const getOperationForOpcode = (op) => match(op.slice(op.length - 2, op.length))
  .on((x) => x === '01', () => opcode1)
  .on((x) => x === '02', () => opcode2)
  .on((x) => x === '03', () => opcode3)
  .on((x) => x === '04', () => opcode4)
  .on((x) => x === '05', () => opcode5)
  .on((x) => x === '06', () => opcode6)
  .on((x) => x === '07', () => opcode7)
  .on((x) => x === '08', () => opcode8)
  .on((x) => x === '09', () => opcode9)
  .otherwise(() => opcode99);

const setInstruction = pipe(
  (runnable) => ({
    runnable,
    opcode: standardizeOpcode(String(runnable.memory[runnable.head])),
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

const provideInput = (runnable, ...input) => ({
  ...runnable,
  input: runnable.input.length
    ? [...runnable.input, ...input]
    : input,
});

const runProgram = (runnable) => match(runInstruction(runnable))
  .on((r) => r.status === statuses.FINISHED, (r) => r)
  .on((r) => r.status === statuses.NEEDS_INPUT, (r) => r)
  .otherwise((r) => runProgram(r));

module.exports = {
  generateRunnable,
  setInstruction,
  updateMemory,
  runProgram,
  standardizeOpcode,
  provideInput,
  getOperationForOpcode,
  statuses,
};
