import { build } from 'esbuild'

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'cjs',
  minify: true,
  target: 'es2020',
  outfile: 'index.js',
}).catch((e) => {
  console.error(e)
  process.exit(1)
})

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  target: 'es2020',
  format: 'esm',
  minify: true,
  outfile: 'index.mjs',
}).catch((e) => {
  console.error(e)
  process.exit(1)
})

build({
  entryPoints: ['src/vahe.ts'],
  bundle: true,
  format: 'cjs',
  minify: true,
  target: 'es2020',
  outfile: 'vahe.js',
}).catch((e) => {
  console.error(e)
  process.exit(1)
})

build({
  entryPoints: ['src/vahe.ts'],
  bundle: true,
  target: 'es2020',
  format: 'esm',
  minify: true,
  outfile: 'vahe.mjs',
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
