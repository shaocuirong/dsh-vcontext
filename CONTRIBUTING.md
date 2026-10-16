# 参与贡献

欢迎提交问题报告或 Pull Request。请提供 Harness、Node.js、Python 和操作系统版本，以及最小复现步骤。日志、截图和数据库中可能包含对话或凭据，提交前请删除个人信息。

```sh
npm ci --ignore-scripts
python -m unittest discover -s tests -v
npm test
```

默认离线核心不依赖模型供应商。请为数据持久化、换页、作用域或触发计数的改动补充回归测试，保留核心页保护、原文不丢失及每轮去重约束。

界面改动请检查宽屏标签页与窄侧栏，并提供使用演示数据的截图。请勿提交真实会话、数据库、API Key、本地路径配置或模型权重。

## 版本发布约定

重大功能更新必须升级次版本号，普通修复升级补丁号；不兼容变更在更新日志中明确说明，1.0 之后按语义化版本升级主版本号。不要只更新代码而保留旧版本。

发布前同步 `package.json`、`package-lock.json` 根项目及 `packages[""]` 的版本、`pyproject.toml`，并更新 `CHANGELOG.md` 与 README 当前版本。运行适合改动的验证后提交；创建同名 `vX.Y.Z` 标签和 GitHub Release，说明功能、修复、升级方式与验证结果。保持正式插件与审阅副本版本一致，禁止覆盖本地数据库与机器配置。
