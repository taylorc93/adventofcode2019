const { initializeProgram } = require('./a');
const {
  pipe,
  filter,
  reduce,
  map,
  match,
  chunk,
} = require('../utils/functional');

const {
  runProgram,
  resetOutput,
  provideInput,
  statuses,
  updateMemory,
} = require('../utils/intcode');

const {
  generateGrid,
  renderGrid,
  insertAtPoint,
} = require('../utils/grid');

const objs = {
  EMPTY: 0,
  WALL: 1,
  BLOCK: 2,
  PADDLE: 3,
  BALL: 4,
};
const handleOutput = (gameState, outputChunk) => match(outputChunk)
  .on(
    (o) => o[0] === -1,
    (o) => ({ ...gameState, score: o[2] }),
  )
  .on(
    (o) => o[2] === objs.EMPTY || o[2] === objs.WALL || o[2] === objs.BLOCK,
    ([x, y, val]) => ({
      ...gameState,
      grid: insertAtPoint(gameState.grid, { x, y }, val),
    }),
  )
  .on(
    (o) => o[2] === objs.PADDLE,
    ([x, y, val]) => ({
      ...gameState,
      grid: insertAtPoint(gameState.grid, { x, y }, val),
      paddlePosition: { x, y },
    }),
  )
  .on(
    (o) => o[2] === objs.BALL,
    ([x, y, val]) => ({
      ...gameState,
      grid: insertAtPoint(gameState.grid, { x, y }, val),
      ballPosition: { x, y },
    }),
  )
  .otherwise(
    ([, , val]) => {
      throw new Error(`Unrecognized tile id ${val}`);
    },
  );

const getMaxX = (output) => Math.max(
  ...filter((_, i) => i % 3 === 0, output),
) + 1;
const getMaxY = (output) => Math.max(
  ...map(Math.abs, filter((_, i) => i % 3 === 1, output)),
) + 1;

const pixelMap = {
  [objs.EMPTY]: ' ',
  [objs.WALL]: '#',
  [objs.BLOCK]: '-',
  [objs.PADDLE]: '_',
  [objs.BALL]: 'O',
};
const initializeGameBoard = (gameState) => gameState.grid
  ? gameState
  : {
    ...gameState,
    grid: generateGrid(
      getMaxY(gameState.runnable.output),
      getMaxX(gameState.runnable.output),
      pixelMap,
    ),
  };

const inputs = {
  LEFT: 1,
  NEUTRAL: 0,
  RIGHT: -1,
};
const getJoystickInput = ({ paddlePosition, ballPosition }) => (
  match(paddlePosition)
    .on((p) => p.x < ballPosition.x, () => inputs.LEFT)
    .on((p) => p.x > ballPosition.x, () => inputs.RIGHT)
    .otherwise(() => inputs.NEUTRAL)
);

const updateGameState = pipe(
  (gameState) => ({ ...gameState, runnable: runProgram(gameState.runnable) }),
  // Only initializes the grid if necessary and has to be done after the first
  // time the program is run to get bounds
  initializeGameBoard,
  (gameState) => reduce(
    handleOutput,
    gameState,
    chunk(3, gameState.runnable.output),
  ),
  /* eslint-disable */
  (gameState) => {
    console.clear();
    renderGrid(gameState.grid);
    console.log(`Score: ${JSON.stringify(gameState.score)}`);
    return gameState;
  },
  /* eslint-enable */
  (gameState) => ({
    ...gameState,
    runnable: provideInput(
      resetOutput(gameState.runnable),
      getJoystickInput(gameState),
    ),
  }),
);

const gameLoop = (gameState) => match(gameState.runnable.status)
  // eslint-disable-next-line
  .on((x) => x === statuses.FINISHED, () => console.log('Game over'))
  .otherwise(() => setTimeout(
    () => gameLoop(updateGameState(gameState)),
    1000 / 30, // 60 fps
  ));

const main = pipe(
  initializeProgram,
  (runnable) => ({
    ...runnable,
    memory: updateMemory({ position: 0, value: 2, memory: runnable.memory }),
  }),
  (runnable) => {
    gameLoop({
      runnable,
      grid: null,
      paddlePosition: null,
      ballPosition: null,
      score: 0,
    });
  },
);

module.exports = {
  main,
};
