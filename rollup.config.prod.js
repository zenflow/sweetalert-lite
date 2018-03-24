const getRollupInputOptions = require('./getRollupInputOptions')
const getRollupOutputOptions = require('./getRollupOutputOptions')

module.exports = [false, true].map(minify => ({
  ...getRollupInputOptions({ minify }),
  output: ['cjs', 'es', 'umd'].map(format => {
    return getRollupOutputOptions({ minify, format })
  }),
}))
