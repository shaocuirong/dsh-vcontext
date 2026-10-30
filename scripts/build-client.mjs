import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// 宿主仍加载一个普通脚本；只合并仓库源码，不打包另一份 React。
const result = await build({ entryPoints: [fileURLToPath(new URL('../client/index.js', import.meta.url))],
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022', charset: 'utf8',
  banner: { js: '// 此文件由 node scripts/build-client.mjs 生成，请编辑 client/ 下的源码。' } });
const target = new URL('../lib/client.js', import.meta.url);
const output = result.outputFiles[0].text;
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== output) throw new Error('客户端产物已过期，请运行 npm run build:client');
} else await writeFile(target, output, 'utf8');
