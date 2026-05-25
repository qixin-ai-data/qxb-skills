---
name: qixin-enterprise-relationship-report
description: 使用启信宝国内企业 MCP 能力，为两家或多家中国企业生成面向客户交付的关联关系深度分析报告，并以 PDF 作为默认正式交付件。适用于用户提供企业名称、统一社会信用代码或注册号，希望判断企业之间是否存在直接或间接股权关系、控制关系、共同受益人、共同股东、共同高管、集团归属、疑似关联、同电话关联及风险外溢时使用。
---

# Qixin CN Enterprise Relationship Report

## Overview

围绕“中国企业之间是否存在关联、关联强度如何、是否可能伴随风险外溢”生成完整客户报告。内部优先依赖国内企业的主体识别、工商、股权、控制链、集团、人物洞察、疑似关联、合作风险与新闻能力建立证据，再按客户口径组织为正式 PDF 报告。

本 skill 为国内版重设计，不再假设海外字段存在，也不依赖全球企业入口。主体确认、参数口径、证据分层和结论表达全部按当前国内 route 设计。

## Reproducibility Contract

为降低不同模型之间的篇幅、分析路径和措辞漂移，必须执行以下三段式流程，不得跳步：

1. 先构建标准化事实对象  
   必须先按 [references/analysis-contract.md](./references/analysis-contract.md) 生成一份内部标准对象，字段顺序、取值范围、缺失写法保持一致。此阶段只做事实摘录，不做散文化表达。

2. 再按硬规则裁定结论  
   必须依据 [references/domestic-capabilities.md](./references/domestic-capabilities.md) 中的证据分级与结论映射规则生成 `final_level`、`top_3_evidence`、`boundary_notes`。不要凭写作感觉升级或弱化结论。

3. 最后按受控模板写报告  
   必须按 [references/report-template.md](./references/report-template.md) 的固定章节顺序和篇幅配额输出，并优先复用 [references/sentence-bank.md](./references/sentence-bank.md) 中的标准话术。除企业名称、比例、日期、风险类型等变量外，尽量不要自由改写。

如果同一组数据无法支持更高等级结论，统一向保守等级收敛，而不是用修辞把结论写“重”。

## PDF-First Delivery

- PDF 是默认且优先的正式交付件。
- 先按 [references/report-template.md](./references/report-template.md) 生成完整 Markdown。
- 再按 [references/pdf-delivery.md](./references/pdf-delivery.md) 使用 [scripts/export-report-pdf.js](./scripts/export-report-pdf.js) 导出 PDF。
- skill 内置品牌图时，优先使用 [assets/logo.png](./assets/logo.png)，便于整个 skill 文件夹直接打包分发。
- 若环境暂时无法直接导出 PDF，可保留同名 HTML 打印稿作为过渡件，但对外统一表述为“已生成可打印版本，可继续导出为 PDF”。

## Customer-Facing Principles

- 不在正文、附注、表头或对话中出现接口名、`api_ref`、`api_id`、`MCP`、参数名、分页字段、`result_ref`、`JSONPath` 等技术术语。
- 不向客户表述“接口失败”“MCP 不可用”“数据源异常”“调用失败”“没有路由”等内部问题。
- 资料不足时统一使用客户语言，例如“当前可核验公开资料有限”“该维度公开信息暂未完整显示”“基于目前公开资料，暂不作绝对判断”。
- 未发现关联或风险，不等于确认不存在关联或风险；必须说明证据边界。
- 报告必须像咨询/尽调交付件，而不是技术日志或数据拼接结果。

## Applicable Scope

默认适用于中国企业，优先覆盖以下国内能力：

- 主体确认：企业解析、工商照面、企业三码、企业基础工商报告、联系方式
- 股权与控制：工商股东、对外投资、实际控制人、实际受益人、实际控制企业
- 集团与关联圈：集团成员、集团图谱、集团对外投资、集团投资方、关联信息汇总、工商风险扫描
- 人物与辅助信号：主要人员、董监高信息洞察、主要人员对外投资任职、疑似关联方、同电话企业
- 风险补强：客户信息尽调、合作风险排查、企业风险统计、企业新闻与重点新闻详情

如果用户要的是“中国企业之间的关联关系客户报告”，优先使用本 skill，而不是全球版。

## Workflow

### 1. Resolve And Lock Entities First

国内版统一先确认主体，不用 `eid` 作为默认主键。

- 用户提供企业名称、统一社会信用代码或注册号时，先做主体解析。
- 主体确认后，至少交叉核验一次工商照面和企业三码。
- 统一记录企业全称、统一社会信用代码、组织机构代码、注册号、所在地和经营状态。
- 若多个候选主体都合理，优先依据地区、统一社会信用代码、经营状态和集团主公司口径收敛。
- 仍存在实质歧义时，先暂停关系判断，请用户确认主体。

### 2. Fill The Analysis Contract Before Writing

在进入报告写作前，必须先完成内部标准对象。

- 按 [references/analysis-contract.md](./references/analysis-contract.md) 补全主体、快照、证据槽位、结论等级、边界说明和客户建议。
- 所有证据先进入固定槽位，再决定是否进入报告正文。
- 证据缺失时写“未见充分证据”或“公开资料有限”，不要用长段落解释空白。

### 3. Read The Domestic Capability Guide

执行前先读 [references/domestic-capabilities.md](./references/domestic-capabilities.md)。

重点关注以下证据层：

1. 主体身份确认与三码核验
2. 关联圈概览与工商风险快照
3. 直接股权与参股控股关系
4. 实际控制人与受益所有人
5. 集团归属、集团投资方向与同一实控圈层
6. 共同股东、共同主要人员、人物外部任职投资
7. 疑似关联方、同电话与其他辅助信号
8. 合作风险、新闻与风险外溢

### 4. Build The Snapshot Before Deep Dive

在正式展开细节前，先为每个主体建立“关系快照”。

- 用关联信息汇总判断关联圈规模、受益所有人数量、清算/破产/司法拍卖/税务异常等总体风险密度。
- 用工商风险扫描判断工商维度的异常密度，例如股东异常、人员异常、变更异常、行政处罚、经营异常、分支异常等。
- 快照章节用于帮助客户快速理解主体体量和风险环境，不单独作为“关联成立”的核心证据。

### 5. Build The Core Relationship Stack

优先拉取并比对以下内容：

- 工商照面、企业三码与联系方式
- 股东、对外投资与主要人员
- 实际控制人和实际受益人
- 实际控制企业、集团成员、集团图谱、集团对外投资、集团投资方
- 董监高信息洞察、主要人员对外投资任职
- 疑似关联方和同电话企业

正文中始终按证据强弱展开，而不是按取数顺序罗列。

### 6. Treat Same-Phone Signals As Derived Evidence

“同电话企业”默认不是一级证据，必须先做来源核验。

- 先从联系方式中提取电话，再做标准化处理。
- 优先采用企业公开主联系电话，谨慎对待总机、园区共用号码、代理记账号码、招商热线和历史失效号码。
- 只有当同电话线索与股权、控制链、集团、共同人员等方向一致时，才可提升其解释力度。

### 7. Use Aggregated Reports As Reinforcement

国内版的聚合接口很有价值，但不要让它们替代基础核验。

- “客户信息尽调”用于补集团、标签、历史沿革和企业画像。
- “合作风险排查”用于补充关联风险外溢，而不是单独证明关联成立。
- 聚合结果较大时，先看 preview，再定点读取目标分块。

### 8. Keep Relationship Conclusions Layered

默认使用以下结论级别：

- 已确认直接关联
- 已确认间接关联
- 存在较强关联信号
- 当前未检索到足够公开证据

其中：

- 直接股权、实际控制链、同一受益人、集团成员直接命中，可作为强证据。
- 共同股东、共同核心管理层、同一实控圈层、人物外部任职投资，可作为中强证据。
- 同电话、疑似关联方、联系方式重合、新闻交叉提及，只能作为辅助或弱中证据。

### 9. Always Write Client Suggestions

报告收尾必须给出客户视角建议，而不是产品设计建议。

建议方向优先包括：

- 客户在合作准入、审批、授信、采购、归档口径中如何使用本次结论
- 是否应将关联方一并纳入风险观察范围
- 是否需要进一步确认上层控制主体、集团母体或关键自然人
- 是否需要持续关注股权、管理层、集团结构或风险事件变化

## Output Contract

- Markdown 工作稿：`[企业A简称]_[企业B简称]_关联关系报告_[YYYY-MM-DD].md`
- PDF 正式交付件：`[企业A简称]_[企业B简称]_关联关系报告_[YYYY-MM-DD].pdf`
- 多主体场景：`[核心主体简称]_多主体关联关系报告_[YYYY-MM-DD].md/.pdf`

回复用户时默认优先给 PDF 路径与一句话结论。

## Deliverable Structure

正式报告默认包含以下章节：

1. 执行摘要
2. 排查目标与主体确认
3. 关系结论总览
4. 关联圈概览与工商风险快照
5. 直接股权与投资关系
6. 控制链与受益所有人关系
7. 集团归属与集团投资链
8. 共同股东、共同主要人员与人物外部任职投资
9. 疑似关联、同电话与其他辅助信号
10. 风险外溢与负面事件观察
11. 结论边界与不确定性
12. 综合判断与客户建议

具体字段、篇幅配额和固定写法要求见 [references/report-template.md](./references/report-template.md)。

## Internal Tooling Rules

- 企业主体确认优先使用 `qxb_op_enterprise_resolve`。
- 国内企业查询优先传企业全称、统一社会信用代码或注册号，不传 `eid`。
- 新接口首次调用前，先用 `qxb_op_api_spec_get` 确认参数，不猜参数名。
- 主体确认阶段至少覆盖 `cn_company_registration_face` 与 `cn_company_triple_codes`。
- 关系快照阶段优先覆盖 `cn_company_related_info_summary` 与 `cn_company_ic_risk_scan`。
- 集团分析阶段除 `cn_company_group_members`、`cn_company_group_graph` 外，补充 `cn_company_group_investments` 与 `cn_company_group_investors`。
- 人物分析阶段在 `cn_company_key_personnel` 基础上，按需补 `cn_executive_insight` 与 `cn_personnel_external_positions`。
- “同电话企业”前必须先读取 `cn_company_contact_info`，完成号码标准化后再使用 `cn_company_same_phone_entities`。
- `cn_customer_due_diligence` 与 `cn_cooperation_risk_scan` 属于聚合接口，先看 preview，再按需补读，不要默认把整块结果直接写进正文。
- 对分页接口默认从 `skip=0` 开始；总量明显较大时继续翻页。
- 报告生成必须遵循“事实对象 -> 规则裁定 -> 模板写作”的顺序，不得直接自由写报告。
- 最终交付前，先生成 Markdown 工作稿，再调用 `node ./scripts/export-report-pdf.js "<report.md>" --logo "./assets/logo.png"` 导出 HTML/PDF。
- 最终报告中不得出现任何内部工具名、接口编号或调用细节。

## References

- 标准化分析对象与字段合同： [references/analysis-contract.md](./references/analysis-contract.md)
- 国内能力边界与结论映射： [references/domestic-capabilities.md](./references/domestic-capabilities.md)
- 报告结构、篇幅配额与固定槽位： [references/report-template.md](./references/report-template.md)
- 标准话术与缺省写法： [references/sentence-bank.md](./references/sentence-bank.md)
- PDF 交付顺序与对外话术： [references/pdf-delivery.md](./references/pdf-delivery.md)

