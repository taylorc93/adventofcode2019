const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe,
  curriedMap,
  map,
  curry,
  match,
  chunk,
  reduce,
} = require('../utils/functional');
const {
  generateRunnable,
  provideInput,
  runProgram,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const generateComputers = (numComputers, memory) => map(
  (_, i) => ({
    address: i,
    program: runProgram(provideInput(generateRunnable(memory), i)),
  }),
  Array(numComputers).fill(),
);

const initializeNetworkState = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  curry(generateComputers)(50),
  (computers) => ({ computers, packet255Value: null }),
);

const processNextPackets = (network) => ({
  ...network,
  computers: map(
    (c) => match(c.program.input)
      .on(
        (input) => input.length === 0,
        () => ({
          ...c,
          program: runProgram(provideInput(c.program, -1)),
        }),
      )
      .otherwise(() => ({ ...c, program: runProgram(c.program) })),
    network.computers,
  ),
});

const sendPacket = (network, computer, [address, x, y]) => {
  if (address === 255) {
    return { ...network, packet255Value: y };
  }

  const receivingComputer = network.computers.find((c) => c.address === address);
  const updatedReceiver = [
    ...network.computers.slice(0, address),
    {
      ...receivingComputer,
      program: provideInput(receivingComputer.program, x, y),
    },
    ...network.computers.slice(address + 1),
  ];

  return {
    ...network,
    computers: [
      ...updatedReceiver.slice(0, computer.address),
      {
        ...computer,
        program: {
          ...computer.program,
          output: computer.program.output.slice(3),
        },
      },
      ...updatedReceiver.slice(computer.address + 1),
    ],
  };
};

const sendPackets = (network) => reduce(
  (currentNetwork, c) => match(chunk(3, c.program.output))
    .on(
      (packets) => packets.length > 0,
      (packets) => sendPacket(currentNetwork, c, packets[0]),
    )
    .otherwise(() => currentNetwork),
  network,
  network.computers,
);

const runNextTick = pipe(
  processNextPackets,
  sendPackets,
);

const runUntilPacket255 = (network) => {
  let current = network;

  while (current.packet255Value === null) {
    current = runNextTick(current);
  }

  return current.packet255Value;
};

const main = pipe(
  initializeNetworkState,
  runUntilPacket255,
);

module.exports = {
  main,
  initializeNetworkState,
  runUntilPacket255,
};
