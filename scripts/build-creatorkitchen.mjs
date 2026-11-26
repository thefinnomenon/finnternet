import { build } from 'esbuild';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import nesting from 'tailwindcss/nesting/index.js';
import autoprefixer from 'autoprefixer';
import typography from '@tailwindcss/typography';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { log } from 'node:console';

const root = fileURLToPath(new URL('../', import.meta.url));
const app = path.join(root, 'demos/creatorkitchen');
const vendor = path.join(app, 'vendor');
const out = path.join(root, 'public/demos/creatorkitchen/app');
const manifest = JSON.parse(
  await readFile(path.join(app, 'source-manifest.json'), 'utf8'),
);
for (const [name, hash] of Object.entries(manifest.files)) {
  const bytes = await readFile(path.join(vendor, name));
  if (createHash('sha256').update(bytes).digest('hex') !== hash)
    throw new Error(
      `Original source changed without a provenance update: ${name}`,
    );
}
await mkdir(path.join(app, '.generated'), { recursive: true });
const css = await postcss([
  nesting(),
  tailwind({
    content: [path.join(vendor, '**/*.{ts,tsx}'), path.join(app, 'app.tsx')],
    theme: { extend: {} },
    plugins: [typography],
  }),
  autoprefixer(),
]).process(await readFile(path.join(vendor, 'styles/globals.css'), 'utf8'), {
  from: path.join(vendor, 'styles/globals.css'),
});
await writeFile(path.join(app, '.generated/base.css'), css.css);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const adapters = path.join(app, 'adapters');
const result = await build({
  absWorkingDir: root,
  entryPoints: [path.join(app, 'app.tsx')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  outdir: out,
  entryNames: 'app-[hash]',
  minify: true,
  metafile: true,
  jsx: 'automatic',
  jsxImportSource: 'react',
  tsconfigRaw: {
    compilerOptions: {
      jsx: 'react-jsx',
      jsxImportSource: 'react',
      target: 'ES2022',
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_PROTOCOL': '"https://"',
    'process.env.NEXT_PUBLIC_DOMAIN': '"creatorkitchen.example"',
    process: '{"env":{}}',
  },
  plugins: [
    {
      name: 'retired-service-boundaries',
      setup(builder) {
        builder.onResolve({ filter: /^@creatorkitchen\/original$/ }, () => ({
          path: path.join(app, 'original-entry.js'),
        }));
        builder.onResolve({ filter: /^prosemirror-dev-toolkit$/ }, () => ({
          path: 'production-devtools',
          namespace: 'disabled-devtools',
        }));
        builder.onLoad(
          { filter: /.*/, namespace: 'disabled-devtools' },
          () => ({
            contents: 'export const applyDevTools = () => {};',
            loader: 'js',
          }),
        );
        builder.onResolve(
          { filter: /^(aws-amplify|@aws-amplify\/api)$/ },
          () => ({ path: path.join(adapters, 'services.ts') }),
        );
        builder.onResolve({ filter: /(?:^|\/)lib\/amplify$/ }, () => ({
          path: path.join(adapters, 'services.ts'),
        }));
        builder.onResolve(
          { filter: /^\.\.\/\.\.\/\.\.\/components\/CommandList$/ },
          () => ({
            path: path.join(adapters, 'CommandList.tsx'),
          }),
        );
      },
    },
  ],
});
const entry = Object.entries(result.metafile.outputs).find(
  ([name, value]) =>
    name.endsWith('.js') && value.entryPoint?.endsWith('app.tsx'),
);
if (!entry || !entry[1].cssBundle)
  throw new Error('Original CreatorKitchen build assets are missing.');
await writeFile(
  path.join(out, 'manifest.json'),
  JSON.stringify({
    javascript: `/demos/creatorkitchen/app/${path.basename(entry[0])}`,
    stylesheet: `/demos/creatorkitchen/app/${path.basename(entry[1].cssBundle)}`,
  }) + '\n',
);
log(
  `Built ${Object.keys(manifest.files).length} original CreatorKitchen source files; built the original editor.`,
);
