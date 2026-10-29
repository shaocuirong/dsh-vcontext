import { parseArgs } from 'node:util';
import { readFileSync, realpathSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { join, resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

// 显式选择仓库与验证范围；不安装依赖、不读取正式配置、不自动切分支。
const profiles = {
  stages: ['context-stages', 'context-catalog', 'context-resolver', 'task-request'],
  resolver: ['context-resolver', 'context-admission', 'result-projection', 'open-result-request',
    'resource-capture', 'snapshot-request', 'quota-transport'],
  coordinator: ['context-control-coordinator', 'context-control-commit', 'session-write', 'automation',
    'history-archive', 'result-projection', 'replacement', 'open-result-request', 'task-request', 'routes'],
  catalog: ['context-catalog', 'evidence-directory', 'snapshot-request', 'task-request'],
  effects: ['context-effects', 'context-versions', 'session-bridge', 'resource-capture', 'snapshot-request'],
  foundation: ['context-control-contract', 'context-control-planner', 'context-control-commit',
    'session-write', 'open-result-planner', 'automation', 'replacement'],
  existing: ['history-segmenter', 'open-result-planner', 'history-archive', 'result-projection',
    'open-result-request', 'automation', 'replacement', 'quota-transport', 'evidence-directory', 'task-request'],
  connection: ['session-access', 'session-write', 'session-bridge', 'existing-session'],
  scheduler: ['context-control-contract', 'context-control-planner', 'context-control-coordinator',
    'context-effects', 'context-resolver', 'context-admission', 'context-control-commit'],
};
const pythonTests = ['test_automation.py', 'test_quota.py', 'test_core_quota.py', 'test_task_state.py',
  'test_evidence.py', 'test_session_snapshots.py', 'test_result_store.py', 'test_result_chunks.py', 'test_control_policy.py', 'test_effects.py', 'test_catalog.py', 'test_control_commit.py', 'test_retrieval.py', 'test_stages.py'];
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { console.error('验证前置条件失败：' + message); process.exit(2); };
let values, root;
try {
  ({ values } = parseArgs({ options: {
    repo: { type: 'string' }, profile: { type: 'string', default: 'package' },
    python: { type: 'string' }, list: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  }, allowPositionals: false }));
  if (values.help) {
    console.log('verify.mjs --repo <绝对路径> --profile package|foundation|effects|catalog|coordinator|resolver|stages|existing|connection|scheduler|python [--list] [--python <解释器>]');
    process.exit(0);
  }
  if (!values.repo || !isAbsolute(values.repo)) throw new Error('必须提供 --repo 仓库绝对路径');
  root = realpathSync(values.repo);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (pkg.name !== 'dsh-virtual-context'
    || !existsSync(join(root, 'adapter', 'automation.mjs'))
    || !existsSync(join(root, 'vcontext', 'quota.py'))) throw new Error('目标不是预期的 dsh-vcontext 仓库');
  if (!['package', 'python', ...Object.keys(profiles)].includes(values.profile))
    throw new Error('未知 profile：' + values.profile);
} catch (error) { fail(error.message); }

if (values.profile === 'package') {
  // 独立于目标运行时依赖，检查可移植包及内部引用；不宣称验证调度行为。
  const required = ['SKILL.md', 'agents/openai.yaml', 'scripts/verify.mjs',
    'references/contract.md', 'references/scheduling.md', 'references/refactor-plan.md',
    'references/validation.md', 'references/research.md', 'references/effects.md', 'references/catalog.md', 'references/coordinator.md', 'references/resolver.md', 'references/stages.md'];
  const missing = required.filter(p => !existsSync(join(skillRoot, p)));
  if (missing.length) fail('skill 包缺文件：' + missing.join(', '));
  const files = [];
  function walk(directory) {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, item.name), info = lstatSync(path);
      if (info.isSymbolicLink()) fail('skill 包不能依赖链接文件：' + relative(skillRoot, path));
      if (info.isDirectory()) walk(path);
      else if (info.isFile()) files.push(path);
    }
  }
  walk(skillRoot);
  for (const path of files.filter(p => p.endsWith('.md'))) {
    const content = readFileSync(path, 'utf8');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1].replace(/^<|>$/g, '');
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#')) continue;
      const target = resolve(dirname(path), decodeURIComponent(href.split('#')[0]));
      const rel = relative(skillRoot, target);
      if (rel === '..' || rel.startsWith('..\\') || rel.startsWith('../') || isAbsolute(rel))
        fail('包内引用越出 skill：' + href);
      if (!existsSync(target)) fail('包内引用不存在：' + href);
    }
  }
  console.log(JSON.stringify({ profile: 'package', checkedFiles: files.length,
    internalLinks: 'valid', runtimeTestsExecuted: false }, null, 2));
  process.exit(0);
}

const isPython = values.profile === 'python';
const paths = isPython ? pythonTests.map(p => join(root, 'tests', p))
  : profiles[values.profile].map(p => join(root, 'tests', p + '.test.mjs'));
const missing = paths.filter(p => !existsSync(p));
const python = values.python || process.env.VCTX_PYTHON || 'python';
const commands = isPython
  ? pythonTests.map(pattern => ({ executable: python,
    args: ['-m', 'unittest', 'discover', '-s', 'tests', '-p', pattern, '-v'] }))
  : [{ executable: process.execPath, args: ['--test', '--test-reporter=tap', ...paths] }];

if (values.list) {
  console.log(JSON.stringify({ profile: values.profile, mode: 'list', runtimeTestsExecuted: false,
    commands, missingFiles: missing.map(p => relative(root, p)) }, null, 2));
  if (missing.length) process.exit(2);
  process.exit(0);
}
if (missing.length) fail('缺少本 profile 测试，不允许静默跳过：' + missing.map(p => relative(root, p)).join(', '));
if (!isPython) {
  try {
    const require = createRequire(join(root, 'package.json'));
    for (const name of ['@deepseek-ai/cordis', '@deepseek-ai/dsh-session', '@deepseek-ai/dsh-agent-loop'])
      require.resolve(name);
  } catch { fail('缺少目标仓库 SDK 依赖；请在开发工作流安装后重试，脚本不自动安装'); }
}
for (const command of commands) {
  const result = spawnSync(command.executable, command.args, {
    cwd: root, encoding: 'utf8', windowsHide: true, timeout: 180000,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, ...(values.python ? { VCTX_PYTHON: values.python } : {}) },
  });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  const output = (result.stdout ?? '') + '\n' + (result.stderr ?? '');
  const valid = isPython
    ? /Ran [1-9]\d* tests? in /.test(output) && /^OK\s*$/m.test(output) && !/\bskipped\b/i.test(output)
    : /^# tests [1-9]\d*$/m.test(output) && /^# skipped 0$/m.test(output);
  if (result.error || result.status !== 0 || !valid) {
    console.error('验证失败：要求实际运行用例、全部通过、0跳过。' + (result.error ? ' ' + result.error.message : ''));
    process.exit(1);
  }
}
console.log('指定 profile 验证通过；未执行真实模型、正式 UI、宿主重启或发布验收。');

