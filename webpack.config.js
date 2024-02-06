const packageJson = require('./package.json');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

var config = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    content: './content/index.mjs',
    background: './background/index.mjs',
    popup: './popup/index.mjs',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          // `.swcrc` can be used to configure swc
          loader: "swc-loader",
          options: {
            env: {
              targets: packageJson.browserslist,
            }
          }
        }
      }
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        './manifest.json',
        './popup.*',
        './images/**/*',
        './_locales/**/*',
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      '...',
      new HtmlMinimizerPlugin(),
      new JsonMinimizerPlugin(),
    ],
  },
  output: {
    clean: true,
    filename: '[name].js',
    path: __dirname + '/dist',
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.optimization.minimize = false;
  }

  return config;
};
