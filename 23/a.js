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
  resetOutput,
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
  (computers) => ({ computers, packet255: null, queue: [] }),
);

const processInput = (network) => ({
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

const updateComputers = (computers, newComputer) => [
  ...computers.slice(0, newComputer.address),
  newComputer,
  ...computers.slice(newComputer.address + 1),
];

const updatePacketQueue = (network) => reduce(
  (currentNetwork, c) => ({
    ...currentNetwork,
    computers: updateComputers(
      currentNetwork.computers,
      { ...c, program: resetOutput(c.program) },
    ),
    queue: [
      ...currentNetwork.queue,
      ...chunk(3, c.program.output),
    ],
  }),
  network,
  network.computers,
);

const sendPackets = (network) => reduce(
  (currentNetwork, [address, ...vals]) => {
    if (address === 255) {
      return { ...network, packet255: vals };
    }

    const receiver = currentNetwork.computers.find(
      (c) => c.address === address,
    );

    return {
      ...currentNetwork,
      computers: updateComputers(
        currentNetwork.computers,
        { ...receiver, program: provideInput(receiver.program, ...vals) },
      ),
      queue: currentNetwork.queue.slice(1),
    };
  },
  network,
  network.queue,
);

const runNextTick = pipe(
  processInput,
  updatePacketQueue,
  sendPackets,
);

const runUntilPacket255 = (network) => {
  let current = network;

  while (current.packet255 === null) {
    current = runNextTick(current);
  }

  return current.packet255[1];
};

const main = pipe(
  initializeNetworkState,
  runUntilPacket255,
);

module.exports = {
  main,
  initializeNetworkState,
  processInput,
  sendPackets,
  updatePacketQueue,
  runUntilPacket255,
};
