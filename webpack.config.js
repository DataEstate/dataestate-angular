// webpack.config.js

const path = require('path');

module.exports = {
  entry: './src/dataEstateModule.ts',
  output: {
    filename: 'dataEstateModule.min.js',
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
