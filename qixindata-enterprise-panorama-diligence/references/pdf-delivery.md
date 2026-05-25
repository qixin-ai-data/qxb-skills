# PDF Delivery

## Goal

把企业全景尽调整理成面向客户的正式交付件。
PDF 是默认交付版本，Markdown 只是过程工作稿。

## Script First

优先使用 [../scripts/export-report-pdf.js](../scripts/export-report-pdf.js) 导出：

```powershell
node .\scripts\export-report-pdf.js "<report.md>" --logo "<logo.png>"
```

如果系统 `node` 不可用，先调用 `load_workspace_dependencies`，使用返回的 Node.js executable 再运行同一脚本。
如未显式传入 `--logo`，脚本默认优先读取 skill 自带的 `assets/logo.png`。

脚本会：

1. 读取 Markdown 工作稿
2. 生成同名 HTML 打印稿
3. 调用本机 Edge 或 Chrome 的 headless 打印生成同名 PDF
4. 返回 HTML 和 PDF 路径

## File Naming

### Brief

- 正式交付件：`[企业简称]_企业全景尽调简版_[YYYY-MM-DD].pdf`
- 工作稿：`[企业简称]_企业全景尽调简版_[YYYY-MM-DD].md`
- 可打印稿：`[企业简称]_企业全景尽调简版_[YYYY-MM-DD].html`

### Formal

- 正式交付件：`[企业简称]_企业全景尽调正式版_[YYYY-MM-DD].pdf`
- 工作稿：`[企业简称]_企业全景尽调正式版_[YYYY-MM-DD].md`
- 可打印稿：`[企业简称]_企业全景尽调正式版_[YYYY-MM-DD].html`

## Output Order

### Brief

1. 先生成完整 Markdown 工作稿
2. 再导出 HTML 和 PDF
3. 检查 PDF 是否存在且文件大小大于 0
4. 回复用户时优先提供简版 PDF 路径
5. 再询问是否继续正式版 PDF

### Formal

1. 用户确认继续后，再生成正式版 Markdown 工作稿
2. 导出 HTML 和 PDF
3. 回复用户时优先提供正式版 PDF 路径

## Customer Language Rules

对用户统一使用：

- “已生成简版 PDF”
- “已生成正式版 PDF”
- “已生成可打印版本，可继续导出为 PDF”

不要使用：

- “脚本执行失败”
- “浏览器打印异常”
- “依赖缺失”
- “转换报错”

## Layout Expectations

- 报告正文直接从结论摘要或执行摘要开始，不插入输入/输出或测试过程
- 封面、执行摘要和结论页要清晰
- 表格紧凑、可读，避免大片空白
- 每节优先给结论，再给证据
- logo 默认使用 skill 自带的 `assets/logo.png`，放在首页右上角，仅展示一次
- 页面按 A4 打印优化

## Retry Rule

若首次未得到 PDF：

1. 先检查 HTML 中间稿是否正常
2. 再检查浏览器路径是否可用
3. 再检查 logo 路径是否有效
4. 重新执行导出

不要因为第一轮失败就停在 Markdown。

## Fallback Rule

若当前环境明确阻止浏览器导出：

- 先保留完整 Markdown
- 再保留可打印 HTML
- 对用户只说“已生成可打印版本，可继续导出为 PDF”

不要把中间技术问题写进用户说明。

## Logo Packaging

- 如需统一品牌展示，优先将 logo 放在 `assets/logo.png`
- 导出时如未显式传入 `--logo`，脚本会优先使用：
  - `assets/logo.png`
  - skill 根目录的 `logo.png`
  - 报告目录中的 `logo.png`
