const path = require('path');
const readline = require('readline');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap, map } = require('../utils/functional');
const { charToAscii } = require('../utils/ascii');

const {
  generateRunnable,
  runProgram,
  provideInput,
  renderAsciiOutput,
  statuses,
  resetOutput,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

const getInput = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      rl.close();
      const ascii = map(charToAscii, [...line.split(''), '\n']);
      resolve(ascii);
    });
  });
};

// Found by playing the text adventure :)
const solution = map(charToAscii, [
  'north\n',
  'west\n',
  'west\n',
  'west\n',
  'west\n',
  'take tambourine\n',
  'east\n',
  'east\n',
  'east\n',
  'north\n',
  'take astrolabe\n',
  'east\n',
  'take hologram\n',
  'east\n',
  'take klein bottle\n',
  'west\n',
  'south\n',
  'west\n',
  'north\n',
].join('').split(''));

const gameLoop = async (runnable) => {
  let current = runnable;

  while (current.status !== statuses.FINISHED) {
    current = runProgram(current);
    renderAsciiOutput(current, false);

    if (current.status === statuses.NEEDS_INPUT) {
      const input = await getInput(); // eslint-disable-line
      current = provideInput(resetOutput(current), ...input);
    }
  }
};

const main = pipe(
  initializeProgram,
  (program) => provideInput(program, ...solution),
  runProgram,
  renderAsciiOutput,
);

// eslint-disable-next-line
const playGame = pipe(
  initializeProgram,
  gameLoop,
);

module.exports = {
  main,
  initializeProgram,
};

// If you want to play the game, uncomment the line below and run `node 25/a.js`
// playGame();
