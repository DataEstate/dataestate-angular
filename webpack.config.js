// webpack.config.js

const path = require('path');

module.exports = {
  entry: {
    dataEstateModule: './src/dataEstateModule.ts',
    'dataEstateModule.full': './src/dataEstateModule.full.ts',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'dataEstateModule',
    libraryTarget: 'var',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    angular: 'angular',
  },
  mode: 'production',
};
