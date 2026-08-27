import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import esbuild from 'rollup-plugin-esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Creates external predicate for rollup from dependencies
 */
const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id) => pattern.test(id);
};

const external = makeExternalPredicate([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]);

const outputOptions = {
  exports: 'named',
  banner: `/*
 * Abby Node.js SDK
 * {@link https://abby.fr}
 * @copyright Abby
 * @license MIT
 */`,
  sourcemap: isDev,
};

const basePlugins = [
  replace({
    preventAssignment: true,
    values: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
    },
  }),
  commonjs(),
  resolve({ preferBuiltins: true }),
  json(),
];

const esbuildOptions = {
  target: 'es2022',
  sourceMap: isDev,
  minify: false,
};

export default [
  // ESM build with preserved modules
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
      ...outputOptions,
    },
    external,
    plugins: [...basePlugins, esbuild(esbuildOptions)],
  },
  // CommonJS build with preserved modules
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].cjs',
      ...outputOptions,
    },
    external,
    plugins: [...basePlugins, esbuild(esbuildOptions)],
  },
];
