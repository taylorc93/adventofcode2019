const {
  pipe,
  reduce,
  match,
  map,
} = require('../utils/functional');
const { statuses, runProgram, provideInput } = require('../utils/intcode');
const { initializeRunnable, getAllPermutations } = require('./a');

const allThrustersFinished = (thrusters) => reduce(
  (allFinished, thruster) => (
    allFinished && thruster.status === statuses.FINISHED
  ),
  true,
  thrusters,
);

const testPhaseSettings = (thrusters) => match(thrusters)
  .on(
    (ts) => allThrustersFinished(ts),
    (ts) => thrusters[ts.length - 1].output,
  )
  .on(
    (ts) => ts[0].status === statuses.FINISHED,
    ([t, ...rest]) => testPhaseSettings([...rest, t]),
  )
  .otherwise(([t, ...rest]) => testPhaseSettings([
    ...rest,
    runProgram(provideInput(t, rest[rest.length - 1].output)),
  ]));

const initializeThrusters = (runnable, settings) => map(
  (setting, i) => i === settings.length - 1
    ? { ...provideInput(runnable, setting), output: 0 } // initial input signal
    : provideInput(runnable, setting),
  settings,
);

const findMaximumSignal = ({ runnable, permutations }) => reduce(
  (max, settings) => (
    match(testPhaseSettings(initializeThrusters(runnable, settings)))
      .on((x) => !max || x > max, (x) => x)
      .otherwise(() => max)
  ),
  null,
  permutations,
);

const main = pipe(
  initializeRunnable,
  (runnable) => ({
    runnable,
    permutations: getAllPermutations([5, 6, 7, 8, 9]),
  }),
  findMaximumSignal,
);

module.exports = {
  main,
  initializeThrusters,
  initializeRunnable,
  testPhaseSettings,
};
