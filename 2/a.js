const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap, curry } = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');
const opcode1 = (x, y) => x + y;
const opcode2 = (x, y) => x * y;

const updateIntcode = (value, position, intcode) => [
  ...intcode.slice(0, position),
  value,
  ...intcode.slice(position + 1, intcode.length),
];

const handleOpcode = (opcodeHandler, position, intcode) => {
  const [
    index1,
    index2,
    updateLocation,
  ] = intcode.slice(position + 1, position + 4);

  return updateIntcode(
    opcodeHandler(intcode[index1], intcode[index2]),
    updateLocation,
    intcode,
  );
};

const runIntcodeProgram = (intcode) => {
  const runAndStore = (currentCode, position) => {
    const opcode = currentCode[position];

    if (opcode === 99) {
      return currentCode[0];
    }

    const opcodeHandler = opcode === 1
      ? opcode1
      : opcode2;

    return runAndStore(
      handleOpcode(opcodeHandler, position, currentCode),
      position + 4,
    );
  };

  return runAndStore(intcode, 0);
};

const main = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  curry(updateIntcode)(12, 1),
  curry(updateIntcode)(2, 2),
  runIntcodeProgram,
);

module.exports = {
  main,
  updateIntcode,
};
