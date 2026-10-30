import { parseArgs } from 'node:util';
import { readFileSync, realpathSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

// 必须显式选择仓库，避免把当前目录或正式安装目录当作隐式执行目标。
let root;
try {
  const { values } = parseArgs({ options: { repo: { type: 'string' } }, allowPositionals: false });
  if (!values.repo) throw new Error('必须提供 --repo 仓库根目录');
  root = realpathSync(values.repo);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (pkg.name !== 'dsh-virtual-context') throw new Error('目标不是 dsh-virtual-context 仓库');
  const require = createRequire(join(root, 'package.json'));
  for (const name of ['@deepseek-ai/dsh-tools', '@deepseek-ai/dsh-agent-loop', '@deepseek-ai/dsh-session'])
    require.resolve(name);
} catch (error) {
  console.error('验证前置条件失败：' + error.message);
  process.exit(2);
}

const tests = [
  'session-access', 'session-bridge', 'live-context', 'existing-session', 'context-integration',
  'adapter', 'real-sdk', 'resource-capture', 'open-result-request',
].map(name => join(root, 'tests', name + '.test.mjs'));
if (tests.some(path => !existsSync(path))) {
  console.error('缺少 Session Access 专项测试文件');
  process.exit(2);
}

// 运行仓库自身测试，所有数据由测试临时夹具创建；不连接正式profile。
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...tests], {
  cwd: root, encoding: 'utf8', windowsHide: true, timeout: 180000, maxBuffer: 16 * 1024 * 1024,
});
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
const skipped = result.stdout?.match(/^# skipped (\d+)$/m)?.[1];
if (result.error || result.status !== 0 || skipped === undefined || Number(skipped) !== 0) {
  console.error('专项验证失败：用例必须全部通过且无跳过');
  process.exit(1);
}
console.log('Session Access 专项验证通过，0跳过；未进行正式桌面重启验收。');
