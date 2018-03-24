const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const svelte = require('rollup-plugin-svelte')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

function getRollupOptions({ minify = false } = {}) {
  return {
    input: 'src/index.js',
    plugins: [
      svelte(),
      babel({
        babelrc: false,
        presets: [
          [
            require.resolve('babel-preset-env'),
            {
              modules: false,
            },
          ],
        ],
        plugins: [
          require.resolve('babel-plugin-external-helpers'),
          require.resolve('babel-plugin-transform-object-rest-spread'),
          require.resolve('babel-plugin-transform-class-properties'),
        ],
        exclude: 'node_modules/**',
      }),
      nodeResolve({
        main: true,
      }),
      commonjs(),
      ...(minify
        ? [
            uglify({
              output: {
                comments: (node, { type, value }) =>
                  type === 'comment2' // multiline comment
                    ? /@preserve|@license|@cc_on/i.test(value)
                    : false,
              },
            }),
          ]
        : []),
    ],
  }
}

module.exports = getRollupOptions
