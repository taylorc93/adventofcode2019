const {
  initializeNetworkState, processInput, updatePacketQueue, sendPackets,
} = require('./a');
const { pipe, reduce, match } = require('../utils/functional');
const { provideInput } = require('../utils/intcode');

const isIdle = (network) => reduce(
  (allWaiting, c) => allWaiting && !c.program.input.length,
  true,
  network.computers,
);

const updateIdleNetwork = (network) => ({
  ...network,
  computers: [
    {
      ...network.computers[0],
      program: provideInput(
        network.computers[0].program,
        network.packet255[0],
        network.packet255[1],
      ),
    },
    ...network.computers.slice(1),
  ],
  duplicateValue: network.nat.lastPacket
    && network.packet255[1] === network.nat.lastPacket[1]
    ? network.packet255[1]
    : null,
  nat: {
    lastPacket: network.packet255,
  },
  packet255: null,
});

const handleIdleNetwork = (network) => match(network)
  .on(isIdle, updateIdleNetwork)
  .otherwise(() => network);

const runNextTick = pipe(
  processInput,
  updatePacketQueue,
  sendPackets,
  handleIdleNetwork,
);

const runUntilDuplicate = (network) => {
  let current = network;

  while (!current.duplicateValue) {
    current = runNextTick(current);
  }

  return current.duplicateValue;
};

const main = pipe(
  initializeNetworkState,
  (network) => ({
    ...network,
    nat: { lastPacket: null },
    duplicateValue: null,
  }),
  runUntilDuplicate,
);

module.exports = {
  main,
  runUntilDuplicate,
};
