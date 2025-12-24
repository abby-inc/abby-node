import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
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
  commonjs(),
  resolve({ preferBuiltins: true }),
  json(),
];

const baseTypeScriptOptions = {
  target: 'ES2022',
  module: 'ES2022',
  moduleResolution: 'bundler',
  strict: true,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
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
    plugins: [
      ...basePlugins,
      typescript({
        ...baseTypeScriptOptions,
        outDir: 'dist/esm',
        declaration: false,
        declarationDir: null,
        declarationMap: false,
        sourceMap: isDev,
      }),
    ],
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
    plugins: [
      ...basePlugins,
      typescript({
        ...baseTypeScriptOptions,
        outDir: 'dist/cjs',
        declaration: false,
        declarationDir: null,
        declarationMap: false,
        sourceMap: isDev,
      }),
    ],
  },
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es',
      sourcemap: isDev,
    },
    external,
    plugins: [
      ...basePlugins,
      typescript({
        ...baseTypeScriptOptions,
        declaration: true,
        declarationDir: 'dist/types',
        declarationMap: isDev,
        emitDeclarationOnly: true,
        outDir: 'dist/types',
      }),
    ],
  },
];

