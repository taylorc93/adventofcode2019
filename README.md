# Advent of Code 2019

This repo contains my solutions to the [Advent of Code 2019](https://adventofcode.com/2019) problems. I tried to solve each problem while adhering to functional programming principles as closely as possible. This primarily meant:

1. All state should be immutable
2. Make as many functions pure as possible
3. Compose functions together
4. Most, if not all, functions should be expressions, not statements

Any deviations (that I noticed) from these principles will be noted in the code with an explantion for why that had to happen.

## Local setup

1. Node >= 10
2. `npm i`

## Running an example:

Each day is contained within it's own directory number 1-25. Since there are 2 parts to each day, each part is contained in either `a.js` or `b.js`. If you want to run an example:

1. Start the node REPL
2. Enter `const { main } = require('./{DAY}/{PART})`, replacing `{DAY}` and `{PART}` with your desired part
3. Run `main()`
4. Main will output the solution for that problem.

If you want to try the solution on different input, replace the contents of `input.txt` with a different set of puzzle input.
