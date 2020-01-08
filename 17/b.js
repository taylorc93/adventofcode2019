const { initializeProgram } = require('./a');
const { pipe, map } = require('../utils/functional');
const { runProgram, provideInput, updateMemory } = require('../utils/intcode');
const { charToAscii, asciiToChar } = require('../utils/ascii');

/*
 * The basic process here was manual. While looking at the output, it was clear
 * that the first set of moves would make up the first routine. From there,
 * B was figured out through guess and check, and C was determined by figuring
 * out (given A and B), what routine would allow us to get to the end.
 */
const moveRoutines = map(Number, [
  ...map(charToAscii, [
    'A',
    ',', 'B',
    ',', 'B',
    ',', 'A',
    ',', 'C',
    ',', 'A',
    ',', 'C',
    ',', 'A',
    ',', 'C',
    ',', 'B',
    '\n',
  ]), // main routine,
  ...map(charToAscii, [
    'R', ',', '6',
    ',', 'R', ',', '6',
    ',', 'R', ',', '8',
    ',', 'L', ',', '1', '0',
    ',', 'L', ',', '4',
    '\n',
  ]), // A
  ...map(charToAscii, [
    'R', ',', '6',
    ',', 'L', ',', '1', '0',
    ',', 'R', ',', '8',
    '\n',
  ]), // B
  ...map(charToAscii, [
    'L', ',', '4',
    ',', 'L', ',', '1', '2',
    ',', 'R', ',', '6',
    ',', 'L', ',', '1', '0',
    '\n',
  ]), // C
  ...map(charToAscii, ['n', '\n']), // video feed
]);

const setMoveRoutines = (program) => provideInput(
  program,
  ...moveRoutines,
);

// Helper function that was used to set the routines
const renderOutput = (p) => { // eslint-disable-line
  console.clear();
  process.stdout.write(p.output.map(asciiToChar).join(''));
};

const main = pipe(
  initializeProgram,
  (p) => ({
    ...p,
    memory: updateMemory({ position: 0, value: 2, memory: p.memory }),
  }),
  setMoveRoutines,
  runProgram,
  (p) => p.output[p.output.length - 1],
);

module.exports = {
  main,
};
