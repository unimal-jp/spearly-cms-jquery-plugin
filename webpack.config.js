const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: './src/spearly-plugin.js',
  output: {
    path: path.resolve(__dirname, './playground/js'),
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
        extractComments: false,
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
