import { parse } from 'acorn';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async path => (await readFile(resolve(root, path), 'utf8')).replaceAll('\r\n', '\n');
const slash = path => path.replaceAll('\\', '/');

function children(node) {
  return Object.entries(node).filter(([key]) => !['loc', 'start', 'end'].includes(key))
    .flatMap(([, value]) => Array.isArray(value) ? value : [value]).filter(value => value && typeof value.type === 'string');
}

export function declarations(source) {
  const tree = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true });
  const symbols = [], imports = [], tests = [];
  const text = node => source.slice(node.start, node.end);
  const callable = node => ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type);
  function callee(node) {
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'ThisExpression') return 'this';
    if (node.type === 'Super') return 'super';
    if (node.type === 'ChainExpression') return callee(node.expression);
    if (node.type === 'CallExpression' || node.type === 'NewExpression') return callee(node.callee) + '(…)';
    if (node.type === 'MemberExpression') return callee(node.object) + '.' + (node.computed ? 'computed' : text(node.property));
    if (callable(node)) return 'IIFE';
    return text(node).replace(/\s+/gu, ' ').slice(0, 80);
  }
  function bindingNames(node) {
    if (node.type === 'Identifier') return [node.name];
    if (node.type === 'AssignmentPattern') return bindingNames(node.left);
    if (node.type === 'RestElement') return bindingNames(node.argument);
    if (node.type === 'ObjectPattern') return node.properties.flatMap(p => bindingNames(p.value ?? p.argument));
    if (node.type === 'ArrayPattern') return node.elements.filter(Boolean).flatMap(bindingNames);
    return [];
  }
  function returnShape(node) {
    if (node.type === 'ObjectExpression') return `对象字段：${node.properties.map(p => p.type === 'SpreadElement' ? '...展开来源' : text(p.key)).join('、')}`;
    if (node.type === 'ArrayExpression') return '数组';
    if (node.type === 'Literal') return node.value === null ? 'null' : typeof node.value;
    if (callable(node)) return '函数';
    return null;
  }
  function local(node) {
    return children(node).flatMap(child => callable(child) || child.type === 'ClassDeclaration' ? [] : [child, ...local(child)]);
  }
  function visit(node, parent, context) {
    if (node.type === 'ImportDeclaration') imports.push(text(node));
    if (node.type === 'CallExpression' && ['test', 'it', 'describe'].includes(text(node.callee))
      && typeof node.arguments[0]?.value === 'string') tests.push(node.arguments[0].value);
    let next = parent;
    if (callable(node) || node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      const name = node.id?.name ?? (context?.type === 'VariableDeclarator' ? text(context.id)
        : ['Property', 'MethodDefinition', 'PropertyDefinition'].includes(context?.type) ? text(context.key)
          : context?.type === 'CallExpression' ? `回调:${callee(context.callee)}@${node.loc.start.line}:${node.loc.start.column}`
            : `匿名函数@${node.loc.start.line}`);
      next = parent ? `${parent}.${name}` : name;
      const body = node.body, members = body ? [body, ...local(body)] : [];
      const returns = members.filter(n => n.type === 'ReturnStatement' && n.argument).map(n => text(n.argument));
      if (node.type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') returns.push(text(body));
      symbols.push({ name: next, short: name, kind: node.type, line: node.loc.start.line, end: node.loc.end.line,
        column: node.loc.start.column, endColumn: node.loc.end.column,
        signature: `${node.async ? 'async ' : ''}${node.generator ? '*' : ''}${name}(${(node.params ?? []).map(text).join(', ')})`,
        params: (node.params ?? []).map(text), returns,
        parameterNames: (node.params ?? []).map(bindingNames),
        returnShapes: [...new Set(members.filter(n => n.type === 'ReturnStatement' && n.argument).map(n => returnShape(n.argument)).filter(Boolean))],
        scenario: context?.type === 'CallExpression' && ['test', 'it', 'describe'].includes(text(context.callee))
          ? context.arguments[0]?.value ?? null : null,
        context: context?.type === 'CallExpression' ? callee(context.callee) : context?.type ?? '',
        calls: [...new Set(members.filter(n => n.type === 'CallExpression' || n.type === 'NewExpression').map(n => callee(n.callee)))],
        errors: [...new Set(members.filter(n => n.type === 'ThrowStatement').map(n => text(n.argument)))],
        fields: [...new Set(members.filter(n => n.type === 'Property' && !n.computed).map(n => text(n.key)))],
        bases: node.superClass ? [text(node.superClass)] : [], decorators: [] });
    }
    for (const child of children(node)) visit(child, next, node);
  }
  visit(tree, '', null);
  return { symbols, imports, tests };
}

async function inventory() {
  // Include new authored files as well as tracked files. Ignore local dependencies and build scratch space.
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).map(slash).filter(p => !p.startsWith('docs/reference/') && !p.startsWith('.documentation-'));
  const pythonPaths = paths.filter(p => p.endsWith('.py'));
  const python = JSON.parse(execFileSync(process.env.VCTX_PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
    ['scripts/document-python.py'], { cwd: root, encoding: 'utf8', input: JSON.stringify(pythonPaths), maxBuffer: 32 * 1024 * 1024 }));
  const files = [];
  for (const path of [...new Set(paths)].sort()) {
    const code = /\.(?:mjs|js|py)$/u.test(path), source = /\.(?:png|jpg)$/u.test(path) ? '' : await read(path);
    const data = path.endsWith('.py') ? python[path] : code ? declarations(source) : { symbols: [], imports: [], tests: [] };
    files.push({ path, ...data, sha256: createHash('sha256').update(/\.(?:png|jpg)$/u.test(path)
      ? await readFile(resolve(root, path)) : source.replaceAll('\r\n', '\n')).digest('hex'),
      headings: path.endsWith('.md') ? [...source.matchAll(/^#{1,3} (.+)$/gmu)].map(m => m[1]) : [],
      keys: path.endsWith('.json') ? Object.keys(JSON.parse(source)) : [],
    });
  }
  return files;
}

async function referencePaths(directory) {
  const result = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = directory + '/' + entry.name;
    if (entry.isDirectory()) result.push(...await referencePaths(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

async function main() {
  const files = await inventory();
  if (process.argv.includes('--inventory')) {
    console.log(JSON.stringify(files, null, 2));
    return;
  }
  // Rendering uses reviewed, project-specific explanations kept outside the generated reference.
  const { renderReference } = await import('./document-render.mjs');
  const outputs = await renderReference(files, root);
  const check = process.argv.includes('--check');
  for (const [path, content] of outputs) {
    if (check) {
      const current = await read(path).catch(() => '');
      if (current.replaceAll('\r\n', '\n') !== content) throw new Error(`文档已过期：${path}，请运行 npm run docs:build`);
    } else {
      await mkdir(dirname(resolve(root, path)), { recursive: true });
      await writeFile(resolve(root, path), content, 'utf8');
    }
  }
  if (check) for (const path of await referencePaths('docs/reference')) {
    if (!outputs.has(path)) throw new Error(`发现不在当前清单内的旧参考页：${path}，请核对源文件是否已经删除或改名`);
  }
  console.log(`${check ? 'Verified' : 'Generated'} ${files.length} files / ${files.reduce((n, f) => n + f.symbols.length, 0)} declarations; ${outputs.size} reference pages`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
