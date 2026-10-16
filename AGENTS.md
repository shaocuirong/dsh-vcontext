# 版本发布约定

用户要求：以后重大更新都必须升级版本并附说明。

- 重大功能更新升级次版本号，普通修复升级补丁号；不兼容变化明确说明，1.0 之后遵循语义化版本。
- 同步 package.json、package-lock.json 根项目和 packages[""]、pyproject.toml 的版本。
- 同步 CHANGELOG.md、README 当前版本、正式插件与审阅副本。
- 完成适合改动的验证后，提交到 GitHub，创建 vX.Y.Z 标签与 GitHub Release，写明功能、修复、升级方式和验证结果。
- 发布前检查是否已有同名标签或 Release；已发布版本不可覆盖，后续修复发新版本。禁止覆盖数据库或本地机器配置。
