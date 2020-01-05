const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe,
  curriedMap,
  reduce,
  filter,
  match,
  map,
} = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const outputs = {
  WALL: 0,
  MOVE: 1,
  FOUND: 2,
};

const directions = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

const getPointForMoves = (moves, start = { x: 0, y: 0 }) => (
  JSON.stringify(reduce(
    ({ x, y }, move) => match(move)
      .on((d) => d === directions.UP, () => ({ x, y: y + 1 }))
      .on((d) => d === directions.DOWN, () => ({ x, y: y - 1 }))
      .on((d) => d === directions.LEFT, () => ({ x: x - 1, y }))
      .otherwise(() => ({ x: x + 1, y })),
    start,
    moves,
  ))
);

const getInverseDirection = (direction) => match(direction)
  .on((d) => d === directions.UP, () => directions.DOWN)
  .on((d) => d === directions.DOWN, () => directions.UP)
  .on((d) => d === directions.LEFT, () => directions.RIGHT)
  .otherwise(() => directions.LEFT);

const getNextPrograms = (runnable, input, visited, start = { x: 0, y: 0 }) => (
  reduce(
    (programs, d) => visited.has(getPointForMoves([...input, d], start))
      ? programs
      : [
        ...programs,
        { program: provideInput(runnable, d), input: [...input, d] },
      ],
    [],
    filter(
      (d) => d !== getInverseDirection(input[input.length - 1]),
      Object.values(directions),
    ),
  )
);

// The woes of no tail call optimization in node continue...
const moveToOxygenSystem = (runnable) => {
  let queue = map(
    (d) => ({ program: provideInput(runnable, d), input: [d] }),
    Object.values(directions),
  );
  let visited = new Set([JSON.stringify({ x: 0, y: 0 })]);

  while (true) { // eslint-disable-line
    const { program, input } = queue[0];
    const newRunnable = runProgram(program);
    visited = visited.add(getPointForMoves(input));
    const output = newRunnable.output[newRunnable.output.length - 1];

    if (output === outputs.FOUND) {
      return { runnable: newRunnable, input };
    }

    queue = output === outputs.WALL
      ? queue.slice(1)
      : [
        ...queue.slice(1),
        ...getNextPrograms(newRunnable, input, visited),
      ];
  }
};

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

const main = pipe(
  initializeProgram,
  moveToOxygenSystem,
  ({ runnable }) => runnable.output.length,
);

module.exports = {
  main,
  initializeProgram,
  moveToOxygenSystem,
  getPointForMoves,
  getNextPrograms,
  directions,
  outputs,
  getInverseDirection,
};
