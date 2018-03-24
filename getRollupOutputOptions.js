const pkg = require('./package.json')

function getRollupOutputOptions({
  minify = false,
  format,
  sourcemap = false,
} = {}) {
  const file = `dist/sweetalert-lite.${format}${minify ? '.min' : ''}.js`
  return {
    format,
    file,
    name: format === 'umd' && 'Swal',
    banner: getBanner(file),
    sourcemap,
  }
}

function getBanner(file) {
  let banner = `/** @preserve
  * package: ${pkg.name} v${pkg.version}
  * file: ${file}\n`
  if (pkg.homepage) {
    banner += `  * homepage: ${pkg.homepage}\n`
  }
  if (pkg.license) {
    banner += `  * license: ${pkg.license}\n`
  }
  return banner + `  **/\n`
}

module.exports = getRollupOutputOptions
