const { initializeReactionState, runReaction } = require('./a');
const { pipe, match } = require('../utils/functional');


const getAmount = (current, place, digit) => current + digit * 10 ** place;

/*
 * Testing fuel amounts incrementally (eg. 1, 2, 3, 4, etc) was way too slow.
 * This method finds the maximum value possible for each digit place less than
 * or equal to the maximum place (provided on the first invocation).
 */
const getMaxFuel = (state, current, place, digit) => (
  match(runReaction(state, 'FUEL', getAmount(current, place, digit)))
    .on(
      (s) => s.oreUsed === 10 ** 12,
      () => getAmount(current, place, digit),
    )
    .on(
      (s) => s.oreUsed > 10 ** 12 && place === 0,
      () => getAmount(current, place, digit - 1),
    )
    .on(
      (s) => s.oreUsed < 10 ** 12,
      () => getMaxFuel(state, current, place, digit + 1),
    )
    .otherwise(() => getMaxFuel(
      state,
      getAmount(current, place, digit - 1),
      place - 1,
      1,
    ))
);

const main = pipe(
  initializeReactionState,
  (state) => getMaxFuel(state, 0, 12, 1),
);

module.exports = {
  main,
};
