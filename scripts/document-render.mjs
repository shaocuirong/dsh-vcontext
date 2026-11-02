import { readFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';
import { files as notes, directoryNotes, purposes, parameters, methodPurposes } from './document-notes.mjs';

const escape = text => String(text).replaceAll('|', '&#124;').replaceAll('\n', ' ');
const inline = text => `\`${escape(text).replaceAll('`', 'ˋ')}\``;
const short = (text, size = 240) => text.replace(/\s+/gu, ' ').length > size
  ? text.replace(/\s+/gu, ' ').slice(0, size) + ' …（表达式较长，请沿源码位置查看）' : text.replace(/\s+/gu, ' ');
const link = (from, target) => posix.relative(posix.dirname(from), target);
const pageFor = path => `docs/reference/files/${path}.md`;
const anchor = symbol => `s-${symbol.line}-${symbol.column}-${symbol.end}-${symbol.endColumn}`;
const symbolLink = (from, path, symbol) => `[${inline(symbol.name)}](${link(from, pageFor(path))}#${anchor(symbol)})`;

function filePurpose(file) {
  if (notes[file.path]) return notes[file.path];
  if (file.path.startsWith('tests/')) {
    const key = file.path.replace(/^tests\/(?:test_)?/u, '').replace(/(?:\.test)?\.(?:mjs|py)$/u, '').replaceAll('_', '-');
    const owner = Object.entries(notes).find(([path]) => path.startsWith('adapter/') && path.endsWith(`/${key}.mjs`))
      ?? Object.entries(notes).find(([path]) => path === `vcontext/${key.replaceAll('-', '_')}.py`);
    return `回归测试：${key}。${owner ? `对应模块的职责是：${owner[1]}` : '覆盖同名功能的输入、边界和结果约束。'} 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。`;
  }
  if (file.path.startsWith('skills/')) {
    if (file.path.endsWith('SKILL.md')) return '维护 skill 的入口说明，规定该子系统如何修改和验证。它约束维护流程，不是模型工具执行入口。';
    if (file.path.includes('/agents/')) return '维护 skill 的展示元数据：名称、说明和启动提示。没有运行方法，也不保存用户会话状态。';
    if (file.path.endsWith('verify.mjs')) return '维护契约的验证脚本，检查指定仓库或打包配置所要求的结构和约束。具体执行范围由命令选项决定。';
    return `维护参考文档：${file.headings?.[0] ?? file.path.split('/').at(-1)}。对应约束以文档正文为准，下列章节可直接定位。`;
  }
  if (file.path.endsWith('.md')) return `说明文档：${file.headings?.[0] ?? file.path}。没有运行方法；章节结构见下方。`;
  if (file.path.endsWith('.png')) return `工作台说明截图（${file.path.split('/').at(-1)}），用于展示界面状态，不作为真实供应商或正式宿主验收证明。`;
  if (file.path.startsWith('.github/')) return 'GitHub 自动化配置，定义触发条件、运行环境和验证步骤，没有可调用的方法。';
  throw new Error(`缺少文件职责说明：${file.path}`);
}

function purpose(file, symbol) {
  const name = symbol.short;
  if (methodPurposes[file.path]?.[name]) return methodPurposes[file.path][name];
  if (symbol.scenario) return `验证场景：${symbol.scenario}。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。`;
  if (name.startsWith('test_')) return `验证 ${name.slice(5).replaceAll('_', ' ')} 场景；输入与期望由该测试方法内的断言定义。`;
  if (name.startsWith('回调:')) {
    const call = symbol.context ?? name.slice(3).split('@')[0];
    const actions = { map: '逐项生成新表示', filter: '筛选保留项', some: '判断是否至少一项满足条件', every: '判断是否全部满足条件',
      reduce: '累积生成汇总值', sort: '比较两项以确定顺序', find: '找到第一项匹配项', findLast: '找到最后一项匹配项',
      flatMap: '逐项转换并展开结果', forEach: '逐项执行当前副作用', effect: '登记并返回清理动作',
      on: '处理该位置登记的宿主/流事件', then: '处理前一异步操作成功结果', catch: '处理前一异步操作失败',
      finally: '在异步操作结束时清理', setTimeout: '在计时结束时处理当前等待', useEffect: '同步 React 生命周期并清理旧订阅',
      useMemo: '按依赖重算派生视图', useCallback: '创建按依赖复用的事件动作', inject: '在宿主依赖就绪时登记服务',
      withWrite: '在受控写租约内执行本次操作', withRead: '消费当前合法只读会话视图', withLiveCut: '消费固定日志切面',
      exclusive: '在同会话执行权内提交工作', local: '在协调器本地事务入口运行工作', Promise: '创建当前异步等待与结算逻辑' };
    const tail = call.split('.').at(-1);
    return `${actions[tail] ?? `执行 ${call} 在此位置委托的工作`}。它属于 ${symbol.name.split('.回调:')[0] || file.path} 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。`;
  }
  if (name.startsWith('匿名函数@') || name.startsWith('lambda@')) return '在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。';
  if (file.path === 'vcontext/core.py' && name === 'write') return '保存页面内容；创建新页或在 expected_version 匹配时追加新修订，并在事务内处理页预算与配额。旧修订仍可按固定版本读取。';
  if (file.path === 'client/runtime.js' && name === 'read') return '读取当前浏览器保存的展示偏好，并规范化不支持的值。';
  if (name.startsWith('install_') && name.endsWith('_schema')) return '在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。';
  if (purposes[name]) return purposes[name];
  if (!file.path.startsWith('tests/') && !file.path.startsWith('lib/')) throw new Error(`缺少方法中文说明：${file.path}:${name}`);
  return `内部辅助声明 ${name}，服务于本文件上方列出的${file.path.startsWith('tests/') ? '测试场景' : '客户端构建逻辑'}。输入、返回和直接调用见下方；没有独立对外权限。`;
}

function papersFor(path) {
  const refs = new Set();
  if (/core\.py|history-|result-|resolver|automation/u.test(path)) refs.add('r1');
  if (/request-window|admission|live-context/u.test(path)) refs.add('r2');
  if (/embedding|evidence-directory/u.test(path)) refs.add('r3');
  if (/stages|state\.py/u.test(path)) refs.add('r4');
  if (/catalog|evidence/u.test(path)) refs.add('r5');
  if (/catalog/u.test(path)) refs.add('r6');
  if (/task|stages/u.test(path)) refs.add('r7');
  if (/session.snapshots|versions|effects/u.test(path)) refs.add('r8');
  if (/evidence|resolver|stage_proofs/u.test(path)) refs.add('r9');
  if (/core\.py|scheduler/u.test(path)) refs.add('r10');
  return [...refs];
}

function parameterNames(param) {
  return [...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])]
    .filter(name => !['true', 'false', 'null', 'undefined', 'self'].includes(name))
    .filter(name => !/^\d/u.test(name));
}

function returns(symbol) {
  if (symbol.kind.includes('Class')) return ['类定义；实例初始化与公开方法分别列在下方。'];
  if (!symbol.returns?.length) return ['没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。'];
  return [...new Set(symbol.returns)].map(value => {
    if (/^(?:async )?(?:function|\([^)]*\)\s*=>|[\w$]+\s*=>)/u.test(value)) return '返回函数或回调，供上层后续调用；内部声明也已单独收录。';
    return inline(short(value));
  });
}

function method(file, symbol, page, sourceBase) {
  const parametersText = symbol.params.length ? symbol.params.map((p, index) => {
    const names = file.path.endsWith('.py') ? [p] : symbol.parameterNames?.[index] ?? parameterNames(p);
    const meaning = names.map(name => `${inline(name)}：${parameters[name] ?? '局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。'}`).join('；');
    return `- ${inline(p)} — ${meaning || '解构/剩余参数，结构见签名。'}`;
  }).join('\n') : '无显式参数。';
  const source = `${sourceBase}/${file.path}#L${symbol.line}`;
  const lines = [`<a id="${anchor(symbol)}"></a>`, `### ${inline(symbol.name)}`, '',
    `[源码 ${symbol.line}–${symbol.end} 行](${source}) · ${symbol.kind}${symbol.bases?.length ? ` · 继承 ${symbol.bases.map(inline).join('、')}` : ''}`, '',
    purpose(file, symbol), '', '```' + (file.path.endsWith('.py') ? 'python' : 'javascript'), symbol.signature, '```', '',
    '**输入**', '', parametersText, '', '**返回路径（源码直接表达式）**', '', ...returns(symbol).map(r => `- ${r}`), '',
    ...(symbol.returnShapes?.length ? ['静态可见返回形状（不含被调方法及展开字段的完整类型）：', '', ...symbol.returnShapes.map(s => `- ${inline(s)}`), ''] : [])];
  if (symbol.decorators?.length) lines.push(`事务/装饰器：${symbol.decorators.map(inline).join('、')}。`, '');
  if (symbol.errors.length) lines.push('**当前声明直接抛出的异常**（被调方法还可能向上传播异常）', '',
    ...symbol.errors.map(e => `- ${inline(short(e, 420))}`), '');
  if (symbol.calls.length) lines.push(`**直接调用**：${symbol.calls.map(c => inline(short(c, 100))).join('、')}。`, '');
  return lines.join('\n');
}

export async function renderReference(files, root) {
  const version = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')).version;
  const sourceBase = `https://github.com/shaocuirong/dsh-vcontext/blob/v${version}`;
  const outputs = new Map(), groups = new Map();
  const count = files.reduce((n, f) => n + f.symbols.length, 0);
  const indexPath = 'docs/reference/README.md';
  const symbolsPath = 'docs/reference/SYMBOLS.md';
  const coverage = { format: 'dsh-source-handbook-v1', files: [], totals: { files: files.length, declarations: count } };
  for (const file of files) {
    const page = pageFor(file.path), group = posix.dirname(file.path);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(file);
    const links = file.imports.flatMap(value => [...value.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/gu)].map(m => m[1]))
      .filter(value => value.startsWith('.')).map(value => posix.normalize(posix.join(group, value)));
    const source = `${sourceBase}/${file.path}`;
    const content = [`# ${inline(file.path)}`, '', '> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。', '',
      `[全部目录](${link(page, indexPath)}) · [方法总索引](${link(page, symbolsPath)}) · [固定版本源码](${source})`, '',
      '## 这个文件解决什么问题', '', filePurpose(file), '',
      ...(papersFor(file.path).length ? ['相关设计研究：' + papersFor(file.path).map(ref => `[${ref.toUpperCase()}](${link(page, 'docs/REFERENCES.md')}#${ref})`).join('、') + '。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。', ''] : []),
      file.path.startsWith('lib/') ? '这是构建产物，声明可能经过重命名；业务修改请回到 client/ 对应源码。' : '这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。', '',
      '## 依赖与阅读顺序', '',
      file.imports.length ? file.imports.map(value => `- ${inline(short(value, 500))}`).join('\n') : '没有静态 import 声明，或此文件是配置/文档/图片。', '',
      ...(links.length ? [`本仓库依赖：${[...new Set(links)].map(p => `[${inline(p)}](${link(page, pageFor(p))})`).join('、')}。`, ''] : []),
      ...(file.keys.length ? ['## 配置顶层字段', '', file.keys.map(inline).join('、') + '。具体字段含义见配置与协议文档；锁文件中的依赖键不属于业务 API。', ''] : []),
      ...(file.headings.length ? ['## 正文章节', '', ...file.headings.map(title => `- ${title}`), ''] : []),
      ...(file.tests?.length ? ['## 验证场景（原始用例名）', '', ...file.tests.map(title => `- ${escape(title)}`), ''] : []),
      '## 声明与方法', '',
      `本文件共 ${file.symbols.length} 个声明。${file.symbols.length ? '签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。' : '此文件没有可调用声明。配置、文档或资源的用途已在上方解释。'}`, '',
      ...file.symbols.map(symbol => `- ${symbolLink(page, file.path, symbol)}（${symbol.line} 行）`), '',
      ...file.symbols.map(symbol => method(file, symbol, page, sourceBase)),
    ].join('\n').trimEnd() + '\n';
    outputs.set(page, content);
    coverage.files.push({ path: file.path, page, sha256: file.sha256, declarations: file.symbols.map(s => ({ name: s.name, kind: s.kind, line: s.line, column: s.column, end: s.end, endColumn: s.endColumn })) });
  }
  const index = ['# 逐目录、逐文件、逐方法参考', '',
    '先读 [从零理解设计](../DESIGN.md)，再按下方目录查文件。接口调用从 [API](../guides/API.md) 开始，论文见 [研究参考](../REFERENCES.md)。', '',
    `本次清点 ${files.length} 个文件、${count} 个声明（包含类、方法、嵌套函数、匿名回调与 Python lambda）。源码和测试、脚本、配置、维护契约、文档、图片、客户端产物都进入文件清单。`, '',
    '每页提供：文件中文职责、依赖、完整声明目录、签名与默认值、参数解释、直接返回路径、直接异常和调用对象。没有方法的文件明确写出用途。', '',
    '## 覆盖口径与更新', '',
    '- 输入由 git ls-files 的已跟踪文件和未忽略新增文件组成；不读取 .git、node_modules、数据库、机器配置和会话日志。',
    '- docs/reference 下是生成输出，不再次自我展开；本索引、方法总索引、操作索引、coverage.json 和 files/ 下每个参考页都属于生成文档。',
    '- 源码链接固定到当前发行标签，确保npm包未包含的测试、CI和锁文件仍能从参考页打开；生产模块之间的阅读链接指向包内参考页。',
    '- JavaScript 使用 Acorn AST，Python 使用标准库 ast，按结构收集声明，不能只用正则匹配 function 或 def。对象方法、类访问器、箭头函数和嵌套回调也在范围内。',
    '- 静态调用列的是源码中直接出现的调用表达式，不能代替完整运行时调用图。返回表达式展示的是实现路径，不声称推断出了完整 JSON Schema。',
    '- npm run docs:build 更新；npm run docs:check 重算并比较全部输出；coverage.json 可以机器核对文件和声明位置。', '',
    '[方法总索引](SYMBOLS.md) · [操作实现索引](OPERATIONS.md) · [机器覆盖清单](coverage.json)', ''];
  for (const [directory, members] of groups) {
    const closest = directoryNotes[directory] ?? Object.entries(directoryNotes).filter(([key]) => directory.startsWith(key + '/')).sort((a,b) => b[0].length - a[0].length)[0]?.[1] ?? '本目录存放对应子系统的配置、参考或验证资源。';
    index.push(`## ${inline(directory === '.' ? '根目录' : directory + '/')}`, '', closest, '', '| 文件 | 用途 | 声明数 |', '|---|---|---:|',
      ...members.map(file => `| [${inline(posix.basename(file.path))}](${link(indexPath, pageFor(file.path))}) | ${escape(filePurpose(file))} | ${file.symbols.length} |`), '');
  }
  outputs.set(indexPath, index.join('\n').trimEnd() + '\n');
  const declarations = files.flatMap(file => file.symbols.map(symbol => ({ file, symbol })));
  const symbols = ['# 方法与声明总索引', '', '[按目录阅读](README.md) · [API](../guides/API.md)', '',
    '包含测试辅助函数、构建产物与全部内部声明。每250个声明分一页，避免过大Markdown在代码托管页面无法阅读。每个文件参考页开头也有完整方法目录。', '',
    '| 分页 | 起始文件 | 结束文件 | 声明数 |', '|---|---|---|---:|'];
  for (let offset = 0; offset < declarations.length; offset += 250) {
    const number = String(offset / 250 + 1).padStart(3, '0');
    const path = `docs/reference/symbols/${number}.md`, batch = declarations.slice(offset, offset + 250);
    const rows = [`# 方法与声明索引 ${number}`, '', '[返回总索引](../SYMBOLS.md)', '',
      '| 文件 | 声明 | 行 | 做什么 |', '|---|---|---:|---|',
      ...batch.map(({file,symbol}) => `| ${inline(file.path)} | ${symbolLink(path, file.path, symbol)} | ${symbol.line} | ${escape(purpose(file, symbol))} |`), ''];
    outputs.set(path, rows.join('\n'));
    symbols.push(`| [第${number}页](symbols/${number}.md) | ${inline(batch[0].file.path)} | ${inline(batch.at(-1).file.path)} | ${batch.length} |`);
  }
  symbols.push('', '## 按文件直接找方法', '', '| 文件 | 声明数 |', '|---|---:|',
    ...files.filter(f => f.symbols.length).map(file => `| [${inline(file.path)}](${link(symbolsPath, pageFor(file.path))}#声明与方法) | ${file.symbols.length} |`), '');
  outputs.set(symbolsPath, symbols.join('\n').trimEnd() + '\n');
  outputs.set('docs/reference/coverage.json', JSON.stringify(coverage, null, 2) + '\n');
  const plugin = await readFile(resolve(root, 'adapter/plugin.mjs'), 'utf8');
  const operations = plugin.match(/operation: \{ type: 'string', required: true, description: '([^']+)'/u)[1].split('|');
  const wrappers = {
    quota_status: ['vcontext/quota.py', 'status'], quota_configure: ['vcontext/quota.py', 'configure'],
    quota_admit: ['vcontext/quota.py', 'admit'], quota_release: ['vcontext/quota.py', 'release'],
    quota_reserve: ['vcontext/quota.py', 'reserve'], quota_commit: ['vcontext/quota.py', 'commit'],
    quota_release_reservation: ['vcontext/quota.py', 'release_reservation'],
    context_resolve: ['adapter/control/resolver.mjs', 'resolve'], context_read: ['adapter/control/resolver.mjs', 'read'],
    context_expand: ['adapter/control/resolver.mjs', 'expand'], context_find: ['adapter/control/resolver.mjs', 'find'],
    context_status: ['adapter/plugin.mjs', 'execute'], context_list: ['adapter/control/catalog.mjs', 'list'],
    evidence_list: ['adapter/evidence-directory.mjs', 'list'], evidence_read: ['adapter/evidence-directory.mjs', 'read'], evidence_note: ['adapter/evidence-directory.mjs', 'note'],
    history_read: ['adapter/history-archive.mjs', 'read'], history_list: ['adapter/history-archive.mjs', 'list'], history_search: ['adapter/history-archive.mjs', 'search'],
    history_pages: ['adapter/history-archive.mjs', 'pages'], history_page_list: ['adapter/history-archive.mjs', 'pageList'],
    resource_capture: ['adapter/resource-capture.mjs', 'captureResource'], schedule: ['vcontext/scheduler.py', 'choose_executor'],
  };
  const path = 'docs/reference/OPERATIONS.md';
  const lines = ['# 模型操作到实现的完整索引', '', '[API 总说明](../guides/API.md) · [HTTP](../interfaces/HTTP.md) · [进程协议](../interfaces/PROTOCOL.md)', '',
    '操作列表直接读取插件 vctx 参数声明。每项给出最终实现入口的签名、返回路径和异常参考；这不是宣称宿主参数与 Python 签名完全相同。exec、agent、id、signal、ctx、transport 等由宿主注入，不放进模型 input。', '',
    'read、resource_read、summary_read、result_read、evidence_read、history_read 等正文读取先经过 resolver.legacy 或统一恢复入口；不能直接照抄内核完整读取调用绕过每步额度。stage_prepare/propose/activate 经阶段控制器补齐宿主证明。详见 API。', '',
    '| 操作 | 作用 | 实现签名（含宿主内部参数） | 方法说明与返回/异常 |', '|---|---|---|---|'];
  for (const op of operations) {
    const wrapper = wrappers[op];
    const candidates = wrapper ? files.filter(f => f.path === wrapper[0]).flatMap(f => f.symbols.filter(s => s.short === wrapper[1]).map(s => ({ f, s })))
      : files.filter(f => f.path.startsWith('vcontext/') && !f.path.endsWith('state.py')).flatMap(f => f.symbols.filter(s => s.short === op).map(s => ({f,s})));
    const fallback = files.filter(f => f.path === 'vcontext/state.py' || f.path === 'vcontext/task_state.py').flatMap(f => f.symbols.filter(s => s.short === op).map(s => ({f,s})));
    const matched = candidates.length ? candidates : fallback;
    if (!matched.length) throw new Error(`操作未映射：${op}`);
    const chosen = matched.at(-1);
    lines.push(`| ${inline(op)} | ${escape(op === chosen.s.short ? purpose(chosen.f, chosen.s) : purposes[op] ?? purpose(chosen.f, chosen.s))} | ${matched.map(({s}) => inline(s.signature)).join('；')} | ${matched.map(({f,s}) => symbolLink(path, f.path, s)).join('；')} |`);
  }
  lines.push('', '## 内核内部入口', '',
    '下列家族由宿主流程调用，其中的内部写入不能由模型直接使用。能从 Python CLI 分发某个名称，不代表已经通过宿主权限或来源校验。完整签名和约束沿方法链接查看。', '',
    '| 入口 | 方法参考 |', '|---|---|');
  for (const file of files.filter(f => f.path.startsWith('vcontext/'))) {
    for (const s of file.symbols.filter(s => /^(?:source_|page_preview|state_bind|state_sync|catalog_|effects_|control_|auto_|ved_|result_(?:store|mark|get|verify|find|plan|upload)|stage_(?:requirements|attest)|task_review)/u.test(s.short)))
      lines.push(`| ${inline(s.short)} | ${symbolLink(path, file.path, s)} |`);
  }
  outputs.set(path, lines.join('\n').trimEnd() + '\n');
  coverage.outputs = [...outputs.keys()];
  coverage.totals.generated_files = outputs.size;
  outputs.set('docs/reference/coverage.json', JSON.stringify(coverage, null, 2) + '\n');
  return outputs;
}
