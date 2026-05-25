# PDF Delivery

## Goal

把国内企业关联关系分析整理成客户正式交付件。PDF 是默认正式版本，Markdown 只是内部工作稿。

## Script First

优先使用 [../scripts/export-report-pdf.js](../scripts/export-report-pdf.js) 导出：

```powershell
node .\scripts\export-report-pdf.js "<report.md>" --logo ".\assets\logo.png"
```

脚本会：

1. 读取 Markdown 工作稿
2. 生成同名 HTML 打印稿
3. 调用本机 Edge 或 Chrome 的 headless 打印生成同名 PDF
4. 返回 HTML 和 PDF 路径

## File Naming

- 正式交付件：`[企业A简称]_[企业B简称]_关联关系报告_[YYYY-MM-DD].pdf`
- 工作稿：`[企业A简称]_[企业B简称]_关联关系报告_[YYYY-MM-DD].md`
- 可打印稿：`[企业A简称]_[企业B简称]_关联关系报告_[YYYY-MM-DD].html`

## Output Order

1. 先生成完整 Markdown
2. 再执行脚本导出 HTML 和 PDF
3. 检查 PDF 是否存在且文件大小大于 0
4. 回复用户时优先提供 PDF 路径

## Customer Language Rules

对外统一使用：

- “已生成正式报告”
- “已生成 PDF 交付件”
- “已生成可打印版本”

不要使用：

- “脚本执行失败”
- “浏览器打印异常”
- “依赖缺失”
- “转换报错”

## Layout Expectations

- 执行摘要和结论页要清晰
- 表格紧凑、可读，避免大片空白
- 每节先给判断，再给证据
- 默认优先使用 [../assets/logo.png](../assets/logo.png) 作为品牌图，并放在首页右上角
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
- 对外只说“已生成可打印版本，可继续导出为 PDF”

不要把中间技术问题写进客户说明。

## Logo Packaging

- 如 skill 需要对外分发，优先将品牌图放在 `assets/logo.png`
- 导出时如未显式传入 `--logo`，优先使用 skill 包内的 `assets/logo.png`
