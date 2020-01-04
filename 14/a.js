const path = require('path');

const { readInputFile, splitByNewline } = require('../utils/readInput');
const {
  pipe, reduce, curriedMap, filter, match,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const parseFormulaItem = (token) => ({
  chemical: token.split(' ')[1],
  amount: Number(token.split(' ')[0]),
});

const convertLineToFormula = pipe(
  (line) => [
    ...line.split('=>')[0].split(','),
    line.split('=>')[1],
  ],
  curriedMap((s) => s.trim()),
  curriedMap(parseFormulaItem),
  (formulaItems) => ({
    input: formulaItems.slice(0, formulaItems.length - 1),
    output: formulaItems[formulaItems.length - 1],
  }),
);

const convertInputToFormulas = (input) => reduce(
  (formulas, line) => [...formulas, convertLineToFormula(line)],
  [],
  input,
);

const getFormulaForChemical = (formulas, chemical) => (
  match(filter((f) => f.output.chemical === chemical, formulas))
    .on((forms) => forms.length === 1, (forms) => forms[0])
    .otherwise((forms) => {
      throw new Error(`${forms.length} formulas for chemical ${chemical}, must be 1`);
    })
);

const updateLeftovers = (state, chemical, leftovers) => ({
  ...state,
  leftovers: {
    ...state.leftovers,
    [chemical]: leftovers,
  },
});

const runReaction = (state, chemical, amount) => {
  const { input, output } = getFormulaForChemical(state.formulas, chemical);
  const cycles = Math.ceil(amount / output.amount);

  return input.length === 1 && input[0].chemical === 'ORE'
    ? {
      ...updateLeftovers(
        state,
        chemical,
        output.amount * cycles - amount,
      ),
      oreUsed: state.oreUsed + input[0].amount * cycles,
    } : reduce(
      (s, i) => runReaction(
        updateLeftovers(s, i.chemical, 0),
        i.chemical,
        i.amount * cycles - (s.leftovers[i.chemical] || 0),
      ),
      updateLeftovers(state, chemical, output.amount * cycles - amount),
      input,
    );
};

const initializeReactionState = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  convertInputToFormulas,
  (formulas) => ({ formulas, oreUsed: 0, leftovers: {} }),
);

const main = pipe(
  initializeReactionState,
  (state) => runReaction(state, 'FUEL', 1),
  (state) => state.oreUsed,
);

module.exports = {
  main,
  initializeReactionState,
  runReaction,
};
