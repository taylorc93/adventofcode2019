const { asciiToChar } = require('./ascii');

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

// If a parameter is used for a write location (eg. the 3rd parameter in opcode
// 1), we need to handle it's differently
const positionMode = (runnable, parameter, write) => write
  ? parameter
  : runnable.memory[parameter] || 0;
const immediateMode = (_, parameter) => parameter || 0;
const relativeMode = (runnable, parameter, write) => write
  ? runnable.relative + parameter
  : runnable.memory[runnable.relative + parameter] || 0;

const getMode = (opcode, n) => Math.floor((opcode / 10 ** (n + 2)) % 10);
const modeHandlers = {
  0: positionMode,
  1: immediateMode,
  2: relativeMode,
};
const getValueForMode = (runnable, mode, parameter, write = false) => (
  modeHandlers[mode](runnable, parameter, write)
);
const instructions = {
  1: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
      getValueForMode(r, getMode(opcode, 1), r.memory[r.head + 2]),
      getValueForMode(r, getMode(opcode, 2), r.memory[r.head + 3], true),
    ];

    return {
      ...r,
      head: r.head + 4,
      memory: updateMemory({
        position: parameters[2],
        value: parameters[1] + parameters[0],
        memory: r.memory,
      }),
    };
  },
  2: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
      getValueForMode(r, getMode(opcode, 1), r.memory[r.head + 2]),
      getValueForMode(r, getMode(opcode, 2), r.memory[r.head + 3], true),
    ];

    return {
      ...r,
      head: r.head + 4,
      memory: updateMemory({
        position: parameters[2],
        value: parameters[1] * parameters[0],
        memory: r.memory,
      }),
    };
  },
  3: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1], true),
    ];

    return r.input.length > 0
      ? {
        ...r,
        head: r.head + 2,
        memory: updateMemory({
          position: parameters[0],
          value: r.input[0],
          memory: r.memory,
        }),
        input: r.input.slice(1),
        status: statuses.READY,
      } : {
        ...r,
        status: statuses.NEEDS_INPUT,
      };
  },
  4: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
    ];

    return {
      ...r,
      head: r.head + 2,
      output: [...r.output, parameters[0]],
    };
  },
  5: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
      getValueForMode(r, getMode(opcode, 1), r.memory[r.head + 2]),
    ];

    return { ...r, head: parameters[0] !== 0 ? parameters[1] : r.head + 3 };
  },
  6: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
      getValueForMode(r, getMode(opcode, 1), r.memory[r.head + 2]),
    ];

    return { ...r, head: parameters[0] === 0 ? parameters[1] : r.head + 3 };
  },
  7: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
      getValueForMode(r, getMode(opcode, 1), r.memory[r.head + 2]),
      getValueForMode(r, getMode(opcode, 2), r.memory[r.head + 3], true),
    ];

    return {
      ...r,
      head: r.head + 4,
      memory: updateMemory({
        position: parameters[2],
        value: parameters[0] < parameters[1] ? 1 : 0,
        memory: r.memory,
      }),
    };
  },
  8: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
      getValueForMode(r, getMode(opcode, 1), r.memory[r.head + 2]),
      getValueForMode(r, getMode(opcode, 2), r.memory[r.head + 3], true),
    ];

    return {
      ...r,
      head: r.head + 4,
      memory: updateMemory({
        position: parameters[2],
        value: parameters[0] === parameters[1] ? 1 : 0,
        memory: r.memory,
      }),
    };
  },
  9: (r, opcode) => {
    const parameters = [
      getValueForMode(r, getMode(opcode, 0), r.memory[r.head + 1]),
    ];

    return { ...r, head: r.head + 2, relative: r.relative + parameters[0] };
  },
  99: (r) => ({ ...r, status: statuses.FINISHED }),
};
const runNextInstruction = (runnable) => {
  const opcode = runnable.memory[runnable.head];

  return instructions[opcode % 100](runnable, opcode);
};

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

const provideInput = (runnable, ...input) => ({
  ...runnable,
  input: [...runnable.input, ...input],
});

const resetOutput = (runnable) => ({ ...runnable, output: [] });

const renderAsciiOutput = (p) => { // eslint-disable-line
  console.clear();
  process.stdout.write(p.output.map(asciiToChar).join(''));
};

module.exports = {
  generateRunnable,
  updateMemory,
  runProgram,
  provideInput,
  resetOutput,
  statuses,
  renderAsciiOutput,
};
