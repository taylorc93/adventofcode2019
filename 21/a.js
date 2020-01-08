const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
  renderAsciiOutput,
} = require('../utils/intcode');
const { charToAscii } = require('../utils/ascii');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

/*
 * The uniques cases that we needed to consider were when the register reported
 * one of the following situtations:
 *
 * ABCD
 * ##.#
 * #..#
 * ...#
 *
 * This translates to: (!A OR !B OR !C) AND D.
 */
const springScript = `NOT A T
NOT B J
OR T J
NOT C T
OR T J
AND D J
WALK
`.split('').map(charToAscii);

const main = pipe(
  initializeProgram,
  (p) => provideInput(p, ...springScript),
  runProgram,
  (p) => {
    renderAsciiOutput(p);
    return p.output[p.output.length - 1];
  },
);

module.exports = {
  main,
  initializeProgram,
};
