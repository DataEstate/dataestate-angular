// build.js

const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./src/dataEstateModule.ts'],
    outfile: './dist/dataEstateModule.min.js',
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2016'],
    // external: ['angular'], // bundle angular as a temporary measure to reduce complexity
    format: 'iife',
    globalName: 'dataEstateModule',
    platform: 'browser', // Ensure it's targeting the browser
    define: {
      require: 'undefined',
    },
    loader: {
      '.ts': 'ts',
    },
  })
  .catch(() => process.exit(1));
