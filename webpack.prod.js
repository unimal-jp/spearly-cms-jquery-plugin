const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const pkg = require('./package.json')

module.exports = {
  mode: 'production',
  entry: './src/spearly-plugin.js',
  output: {
    path: path.resolve(__dirname, './dist'),
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
    new webpack.BannerPlugin(
      `Spearly CMS jQuery Plugin\n\nCopyright 2022 unimal Co.,Ltd.\nLicensed under ${pkg.license}`
    ),
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
}
