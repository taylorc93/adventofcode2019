const {
  initializeProgram,
  moveToOxygenSystem,
  getPointForMoves,
  directions,
  outputs,
  getNextPrograms,
} = require('./a');

const { resetOutput, provideInput, runProgram } = require('../utils/intcode');
const { pipe, map } = require('../utils/functional');

const getTimeUntilRefilled = ({ runnable, location }) => {
  let queue = map(
    (d) => ({ program: provideInput(runnable, d), input: [d] }),
    Object.values(directions),
  );
  let visited = new Set([location]);
  const start = JSON.parse(location);
  let currentProgram = null;

  while (queue.length >= 1) {
    const { program, input } = queue[0];
    currentProgram = runProgram(program);
    visited = visited.add(getPointForMoves(input, start));
    const output = currentProgram.output[currentProgram.output.length - 1];

    queue = output === outputs.WALL
      ? queue.slice(1)
      : [
        ...queue.slice(1),
        ...getNextPrograms(currentProgram, input, visited, start),
      ];
  }

  return currentProgram.output.length;
};

const main = pipe(
  initializeProgram,
  moveToOxygenSystem,
  ({ runnable, input }) => ({
    runnable: resetOutput(runnable),
    location: getPointForMoves(input),
  }),
  getTimeUntilRefilled,
);

module.exports = {
  main,
};
