# PDF Delivery

默认先生成完整 Markdown，再使用：

```bash
node ./scripts/export-report-pdf.js "<report.md>" --logo "./assets/logo.png"
```

## Naming

- Markdown：`[企业简称]_关联企业传导风险报告_[YYYY-MM-DD].md`
- PDF：`[企业简称]_关联企业传导风险报告_[YYYY-MM-DD].pdf`
- HTML：`[企业简称]_关联企业传导风险报告_[YYYY-MM-DD].html`

## Delivery Rule

- 对用户默认优先返回 PDF 路径。
- 若环境暂时无法直接导出 PDF，可保留同名 HTML 作为打印稿，但对外表述统一为“已生成可打印版本，可继续导出为 PDF”。
