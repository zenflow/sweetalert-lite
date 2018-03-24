const getRollupInputOptions = require('./getRollupInputOptions')
const getRollupOutputOptions = require('./getRollupOutputOptions')

module.exports = {
  ...getRollupInputOptions(),
  output: ['cjs', 'es', 'umd'].map(format => {
    return getRollupOutputOptions({ format, sourcemap: true })
  }),
}
