const {
  pipe, curry, match, memoize,
} = require('../utils/functional');
const { runProgram, initializeIntcode, updateIntcode } = require('./a');

const setNoun = curry(updateIntcode)(1);
const setVerb = curry(updateIntcode)(2);

const setNounAndVerb = (noun, verb) => pipe(
  setNoun(noun),
  setVerb(verb),
);

const setAndRun = (intcode) => (noun, verb) => (
  runProgram(
    setNounAndVerb(noun, verb)(intcode),
  )
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
const getNounAndVerbForValue = (value) => (intcode) => {
  const memSetAndRun = memoize(setAndRun(intcode));
  const findNoun = (noun) => (
    match(memSetAndRun(noun, 0))
      .on(
        (x) => x > value && memSetAndRun(noun - 1, 0) < value,
        () => noun - 1,
      )
      .on((x) => x === memSetAndRun(noun - 1, 0), () => noun)
      .on((x) => x === value, () => noun)
      .on((x) => x > value, () => findNoun(noun - 1))
      .otherwise(() => findNoun(noun + 1))
  );
  const findVerb = (noun) => ({
    noun,
    verb: value - memSetAndRun(noun, 0),
  });

  return pipe(
    findNoun,
    findVerb,
  )(0);
};

const calculateAnswer = ({ noun, verb }) => 100 * noun + verb;

const main = pipe(
  initializeIntcode,
  getNounAndVerbForValue(19690720),
  calculateAnswer,
);

module.exports = {
  main,
  setNounAndVerb,
  setAndRun,
  getNounAndVerbForValue,
};
