const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const mode = 'development'

module.exports = {
  mode,
  entry: './src/spearly-plugin.js',
  output: {
    path: mode === 'development' ? path.resolve(__dirname, './playground/js') : path.resolve(__dirname, './dist'),
    filename: 'spearly-plugin.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: 'all',
        terserOptions: { compress: { drop_console: true } },
      }),
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
}
