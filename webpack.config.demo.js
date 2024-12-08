const path = require('path');

module.exports = {
  entry: './demo/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/demo'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.demo.json'),
            transpileOnly: true, // Ensure full type-checking
            // onlyCompileBundledFiles: true, // Compile only files used in the bundle
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'demo'),
    },
    compress: true,
    port: 8086,
  },
};
