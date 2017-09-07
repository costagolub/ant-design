// This config is for building dist files
const webpack = require('webpack');
const getWebpackConfig = require('antd-tools/lib/getWebpackConfig');
const StringReplacePlugin = require('string-replace-webpack-plugin');

// noParse still leave `require('./locale' + name)` in dist files
// ignore is better
// http://stackoverflow.com/q/25384360
function ignoreMomentLocale(webpackConfig) {
  delete webpackConfig.module.noParse;
  webpackConfig.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
}

function addLocales(webpackConfig) {
  let packageName = 'antd-with-locales';
  if (webpackConfig.entry['antd.min']) {
    packageName += '.min';
  }
  webpackConfig.entry[packageName] = './index-with-locales.js';
  webpackConfig.output.filename = '[name].js';
}

function addStringReplacePlugin(webpackConfig) {
  const distPackageWarning = `
    const ENV = process.env.NODE_ENV;
    if (ENV !== 'production' &&
        ENV !== 'test' &&
        typeof console !== 'undefined' &&
        console.warn &&
        typeof window !== 'undefined') {
      console.warn(
        'You are using a whole package of antd, ' +
        'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
      );
    }
  `;

  webpackConfig.module.loaders.push({
    test: /components\/index\.tsx$/,
    loader: StringReplacePlugin.replace({
      replacements: [
        {
          pattern: /\/\/ @dist-package-warning/,
          replacement() {
            return distPackageWarning;
          },
        },
      ],
    }),
  });
}

module.exports = function (webpackConfig) {
  webpackConfig = getWebpackConfig(webpackConfig, true);
  if (process.env.RUN_ENV === 'PRODUCTION') {
    webpackConfig.forEach((config) => {
      ignoreMomentLocale(config);
      addLocales(config);
      addStringReplacePlugin(config);
    });
  }
  return webpackConfig;
};
