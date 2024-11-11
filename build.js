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
    external: ['angular'],
    format: 'iife',
    globalName: 'dataEstateModule',
    loader: {
      '.ts': 'ts',
    },
  })
  .catch(() => process.exit(1));
