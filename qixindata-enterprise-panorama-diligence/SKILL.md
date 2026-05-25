---
name: qixindata-enterprise-panorama-diligence
description: 使用启信宝国内企业 MCP 能力，为投资、采购、商务、法务、合规等场景，对单一中国企业输出可面向客户交付的“企业全景尽调”材料。适用于用户提供企业名称、统一社会信用代码或注册号，希望快速了解企业背景、股权结构、控制链、管理层、经营状态、主要风险，并先生成简版尽调报告、再按需扩展正式报告时使用。默认将简版与正式版导出为 PDF 交付件，Markdown 仅作为过程工作稿；完成简版 PDF 后主动询问是否继续生成正式版 PDF，不输出底层调用过程、测试脚手架或内部备注。
---

# Qixin CN Enterprise Panorama Due Diligence

## Overview

围绕单一中国企业主体，先生成一份可面向客户交付的简版基础尽调材料，再在用户确认后扩展成正式版报告。
最终正式交付件默认是 PDF，Markdown 只作为生成和导出的过程文件。
把输出重点放在“背景是否清晰、股权和控制链是否可解释、管理层和经营状态是否稳定、当前主要风险在哪里、下一步还要补什么”。
报告正文直接从“结论摘要”或“执行摘要”开始，不写“测试输入”“测试输出”“用户需求”或“调用过程”。

## Safety Boundaries

- 只执行只读企业查询与分析，不做监控、订阅、名单维护、写回或对外发送。
- 把本 skill 视为客户可阅读的基础尽调材料，不把它表述成法律意见、投资建议、授信审批或最终准入结论。
- 不在对外输出或报告正文里出现 `api_ref`、`api_id`、`MCP`、`result_ref`、`JSONPath`、分页参数或底层报错。
- 未检索到负面信息不等于无风险；信息不足时明确写“信息不足”或“待进一步核验”。
- 不把营业执照原件、身份证号、银行账户、合同扫描件、印章图样等敏感资料写入 skill 资源或示例。
- 默认先出简版 PDF。只有用户明确确认继续，或从一开始就明确要求“直接正式版”，才继续正式版 PDF。

## Working Style

- 先确认主体，再做全景扫描；主体不清晰时，不直接进入正式尽调写作。
- 先整理统一事实表，再写结论；不要边拉数据边写长文。
- 把“已核事实”“分析判断”“待核事项”区分开写，不要把推断写成事实。
- 默认使用表格加短段分析，避免写成长篇散文。
- 保持客户交付口径：结论清楚、证据简洁、措辞稳健，不暴露内部流程。
- 先生成 Markdown 工作稿，再导出 PDF；不要跳过工作稿直接拼装 PDF。
- 报告正文直接从结论摘要或执行摘要开始，不写“测试输入”“测试输出”“用户需求”“调用过程”等前置章节。
- 当用户其实只需要主体核验或准入放行时，优先转去更窄的 companion skill，而不是硬做全景报告。

## PDF-First Delivery

- PDF 是默认正式交付件。
- Markdown 仅作为内部工作稿和导出底稿保留。
- 导出顺序统一遵循 [references/pdf-delivery.md](./references/pdf-delivery.md)。
- 优先使用 [scripts/export-report-pdf.js](./scripts/export-report-pdf.js) 生成同名 HTML 打印稿和 PDF。
- 默认使用 skill 自带的 [assets/logo.png](./assets/logo.png) 作为首页右上角品牌标识。
- 如环境阻止 PDF 导出，至少保留完整 Markdown 和可打印 HTML，并对用户统一表述为“已生成可打印版本，可继续导出为 PDF”。

## Companion Skills

- 只想确认“是不是这家企业”时，优先使用 `$qixin-cn-counterparty-identity-check`。
- 只想判断“能不能进入下一步准入、开户或接入流程”时，优先使用 `$qixin-cn-pre-admission-check`。
- 已完成简版，且用户明确需要更深章节或更成熟的 PDF 版式时，可参考 `$qixin-cn-enterprise-detail-report` 的章节深度和导出流程，但要保持当前客户交付口径。

## Case Object

```json
{
  "audience": "investment|procurement|business|generic",
  "report_mode": "brief|formal",
  "requested_company": "",
  "canonical_name": "",
  "credit_code": "",
  "reg_no": "",
  "company_status": "",
  "legal_rep": "",
  "established_date": "",
  "registered_capital": "",
  "registered_address": "",
  "industry": "",
  "main_business": "",
  "shareholders": [],
  "actual_controller": "",
  "beneficial_owner": "",
  "key_people": [],
  "group_links": [],
  "operating_signals": [],
  "risk_signals": [],
  "news_signals": [],
  "open_questions": []
}
```

不要把这个对象原样抛给用户；它只是用来稳定推理顺序和后续写作。

## Workflow

### 1. Set The Scope Before Querying

- 先识别用户视角：`investment`、`procurement`、`business` 或 `generic`。
- 先识别交付目标：默认 `brief`；只有用户明确要求时才直接进 `formal`。
- 若用户输入很薄，至少补到“企业名称加一个强标识”再开始。强标识优先级：统一社会信用代码、注册号、完整企业全称。
- 若用户说的是“帮我先看个大概”，默认直接走简版。

### 2. Resolve The Enterprise

- 从企业名称、统一社会信用代码或注册号出发，优先调用 `qxb_op_enterprise_resolve`。
- 锁定唯一主体后，后续统一使用正式企业全称。
- 若存在多个高度相近主体，优先用地区、统一社会信用代码、登记状态、法定代表人缩小范围；仍不清晰时先停下并请用户确认。
- 不是中国企业主体，或当前能力边界无法覆盖时，明确说明边界并停止当前流程。

### 3. Build The Minimal Panorama Fact Sheet

首次调用某个新接口前，先用 `qxb_op_api_spec_get` 确认参数，不要猜参数名。
简版默认优先补齐这些块；详细路由见 [references/mcp-playbook.md](./references/mcp-playbook.md)。

- 基础背景：`cn_company_registration_face`、`cn_company_registration_report`、`cn_company_triple_codes`、`cn_company_contact_info`、`cn_company_industry_nec`、`cn_company_scale`、`cn_company_entity_nature`、`cn_company_capital_background`、`cn_company_profile`、`cn_company_main_business`
- 股权与控制：`cn_company_shareholders_ic`、`cn_company_equity_change`、`cn_company_beneficial_owners`、`cn_company_actual_controllers`
- 管理层与关键人物：`cn_company_key_personnel`
- 历史与组织：`cn_company_change_records`、`cn_company_historical_names`、`cn_company_branches`
- 集团与对外布局：`cn_company_outbound_investments`、`cn_company_group_members`、`cn_company_group_graph`、`cn_company_controlled_companies`
- 经营辅助信息：`cn_company_domains`、`cn_company_certificates`、`cn_company_annual_report_websites`
- 风险概览：`cn_company_risk_statistics`、`cn_company_credit_score`、`cn_company_composite_risk`、`cn_company_shell_index`、`cn_company_contract_default_index`、`cn_company_justice_risk`
- 重点负面事项：按需补 `cn_company_abnormal_operations`、`cn_company_serious_illegal`、`cn_company_administrative_penalties`、`cn_company_tax_arrears`、`cn_company_major_tax_illegal`、`cn_company_executed`、`cn_company_dishonest_executed`、`cn_company_case_filing`、`cn_company_hearing_notices`、`cn_company_high_consumption_restrictions`
- 舆情补充：`cn_company_news`，必要时用 `cn_company_news_detail`

### 4. Use Aggregate Interfaces As Accelerators, Not As The First Reflex

- 当用户一开始就要“快速全景结论”，或需要跨板块兜底时，使用 `cn_customer_due_diligence` 聚合企业背景、沿革、集团、资质、域名等块。
- 当重点是合作前风险扫描时，使用 `cn_cooperation_risk_scan` 聚合诉讼、执行、处罚、欠税、异常经营等块。
- 当关键人物需要追加洞察时，使用 `cn_executive_insight`，必要时再补 `cn_personnel_external_positions`。
- 聚合结果较大时，先看 preview，再用 `qxb_op_result_query` 定点钻取；不要把整包结果原样倒进报告。

### 5. Apply Audience-Specific Emphasis

- `investment`：额外关注资本背景、实际控制人、实际受益人、股权变更、对外投资、集团结构、财务线索、重大司法和税务风险。
- `procurement`：额外关注经营状态、资质证照、行政许可、异常经营、行政处罚、欠税、执行信息、产品投诉或召回、供应链稳定性。
- `business`：额外关注主营业务、集团背景、域名与官网、资质标签、新闻舆情、客户、供应商、招投标等外部合作信号。
- `generic`：保持均衡覆盖，不主动展开行业深挖。

### 6. Normalize Facts Before Writing

在真正写报告前，先按照 [references/dimension-checklist.md](./references/dimension-checklist.md) 整理六个判断维度：

- 主体与背景清晰度
- 股权与控制链清晰度
- 管理与治理稳定性
- 经营活跃度与经营支持信息
- 风险暴露水平
- 后续动作建议

每个维度都要写出：

- 当前结论档位
- 核心依据
- 仍待核验的问题

### 7. Draft The Brief Markdown Working File

- 严格优先写简版 Markdown 工作稿，格式使用 [references/brief-report-template.md](./references/brief-report-template.md)。
- 简版目标是让客户在 3 到 5 分钟内抓住核心事实和主要风险，而不是穷尽所有细节。
- 默认篇幅控制在 1 到 3 页 Markdown 等量内容。
- 核心章节至少覆盖：结论摘要、企业背景、股权与控制、管理层、经营状态、主要风险、下一步建议。
- 若某块信息不足，明确写“信息不足”或“待补充核验”，不要用空话填满。
- 简版正文从“结论摘要”开始，不插入输入/输出说明、测试脚手架或继续追问文案。

### 8. Export The Brief PDF

- 使用 [references/pdf-delivery.md](./references/pdf-delivery.md) 中的顺序导出简版 PDF。
- 默认命名为：Markdown 工作稿、HTML 打印稿、PDF 正式交付件三件套。
- 优先回复 PDF 路径，而不是先强调 Markdown。

### 9. Stop And Ask Before The Formal Report

简版 PDF 完成后，默认在对话里用一句清晰的话停下来，例如：

`简版 PDF 已生成。如需，我可以继续扩展为正式版 PDF 报告，补齐历史沿革、集团布局、经营辅助信息、风险细项和待办清单。是否继续生成正式版？`

除非用户一开始就明确说“直接正式版”，否则不要自动继续。
不要把这句继续追问文案写进 PDF 正文。

### 10. Expand To The Formal Markdown Working File Only After Confirmation

- 用户确认继续后，再按 [references/formal-report-template.md](./references/formal-report-template.md) 扩展正式版 Markdown 工作稿。
- 正式版不是把简版简单拉长，而是要补齐：
  - 主体识别与沿革
  - 股权穿透与控制解释
  - 管理层与关键人物观察
  - 对外投资、集团与关联布局
  - 经营辅助信息与资质
  - 风险细分与重点事项
  - 面向当前场景的关注点和补件建议

### 11. Export The Formal PDF

- 正式版写完后，继续按 [references/pdf-delivery.md](./references/pdf-delivery.md) 导出正式版 PDF。
- 正式版 PDF 是第二阶段正式交付件；Markdown 仍仅保留为工作稿。

## Output Contract

- 简版正式交付件：`[企业简称]_企业全景尽调简版_[YYYY-MM-DD].pdf`
- 简版工作稿：`[企业简称]_企业全景尽调简版_[YYYY-MM-DD].md`
- 简版可打印稿：`[企业简称]_企业全景尽调简版_[YYYY-MM-DD].html`
- 正式版正式交付件：`[企业简称]_企业全景尽调正式版_[YYYY-MM-DD].pdf`
- 正式版工作稿：`[企业简称]_企业全景尽调正式版_[YYYY-MM-DD].md`
- 正式版可打印稿：`[企业简称]_企业全景尽调正式版_[YYYY-MM-DD].html`
- 默认回答顺序：
  1. 说明已生成 PDF
  2. 视需要补充 Markdown 工作稿路径
  3. 在简版完成后询问是否继续正式版
- 若用户明确要求直接正式版，可跳过中间停顿，但最终仍优先交付正式版 PDF。

## References

- 接口路由与默认查询组合：[references/mcp-playbook.md](./references/mcp-playbook.md)
- 维度判断口径与待核清单：[references/dimension-checklist.md](./references/dimension-checklist.md)
- 简版结构模板：[references/brief-report-template.md](./references/brief-report-template.md)
- 正式版结构模板：[references/formal-report-template.md](./references/formal-report-template.md)
- PDF 导出与对外交付口径：[references/pdf-delivery.md](./references/pdf-delivery.md)
