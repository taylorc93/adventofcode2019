const { pipe, match } = require('../utils/functional');
const { initializeMemory } = require('./a');
const {
  runProgram,
  generateRunnable,
  updateMemory,
} = require('../utils/intcode');

const setNoun = (noun) => (memory) => updateMemory({
  position: 1,
  value: noun,
  memory,
});

const setVerb = (verb) => (memory) => updateMemory({
  position: 2,
  value: verb,
  memory,
});

const setNounAndVerb = (noun, verb) => pipe(
  setNoun(noun),
  setVerb(verb),
);

const setAndRun = (noun, verb) => pipe(
  setNounAndVerb(noun, verb),
  generateRunnable,
  runProgram,
  (r) => r.memory[0],
);

/*
 * Algorithm for finding the noun and verb:
 * 1. Start at noun 0, verb 0
 * 2. Find the noun:
 *    - Run program for current noun with verb set to 0
 *    - If output(noun) === value, return noun
 *    - If output(noun) === output(noun - 1), return noun. This is an edge case
 *      where the noun has no effect on final value
 *    - If output(noun) > value && output(noun - 1) < output, return noun - 1
 *    - If output(noun) > value, recurse with noun - 1
 *    - If output(noun) < value, recurse with noun + 1
 * 2. Find verb:
 *    - Any increment or decrement to the verb increases or decrease the output
 *      by 1, so this can be found via value - ouput(noun), verb once again
 *      being set to 0 for output(noun)
 */
const getNounAndVerbForValue = (value) => (memory) => {
  const findNoun = (noun) => (
    match(setAndRun(noun, 0)(memory))
      .on(
        (x) => x > value && setAndRun(noun - 1, 0)(memory) < value,
        () => noun - 1,
      )
      .on((x) => x === setAndRun(noun - 1, 0)(memory), () => noun)
      .on((x) => x === value, () => noun)
      .on((x) => x > value, () => findNoun(noun - 1))
      .otherwise(() => findNoun(noun + 1))
  );
  const findVerb = (noun) => ({
    noun,
    verb: value - setAndRun(noun, 0)(memory),
  });

  return pipe(
    findNoun,
    findVerb,
  )(0);
};

const calculateAnswer = ({ noun, verb }) => 100 * noun + verb;

const main = pipe(
  initializeMemory,
  getNounAndVerbForValue(19690720),
  calculateAnswer,
);

module.exports = {
  main,
  setNounAndVerb,
  setAndRun,
  getNounAndVerbForValue,
};
