---
name: qixindata-related-enterprise-risk-report
description: 使用启信宝国内企业 MCP 能力，为中国企业生成面向客户交付的“关联企业传导风险”报告。适用于用户提供一家中国企业名称、统一社会信用代码或注册号，希望评估其关联企业、同实控圈、关键人物外部网络、集团成员或疑似关联方是否存在司法、经营、税务、处罚等风险，并判断这些风险是否可能向目标主体传导、外溢或形成合作阻断时使用。输出必须面向客户，不呈现 api_ref、api_id、MCP、参数名、result_ref、JSONPath 或内部报错。
---

# Qixin CN Related Enterprise Risk Propagation Report

## Overview

围绕“目标企业的关联圈是否存在风险、这些风险会不会传导到目标主体、传导链条强弱如何”生成正式客户报告。

默认同时回答 4 个问题：

1. 目标企业的关联圈主要由哪些关系构成。
2. 哪些关联主体存在较强风险信号。
3. 风险通过哪条关系链最可能传导到目标主体。
4. 当前应将目标主体评为低/中/高哪一档传导风险。

不要把它写成普通“企业风险报告”或普通“关联关系报告”。本 skill 的核心是“关系网络 + 风险证据 + 传导判断”三层联动。

## Use This Skill

用户出现以下意图时优先使用本 skill：

- 查询关联企业传导风险
- 查询关联方风险外溢
- 评估集团内风险是否会传到母公司/核心主体
- 看核心高管关联企业是否会反向影响目标公司
- 合作前想判断关联圈是否会带来潜在阻断
- 想做“关联企业风险穿透”“风险链路”“风险外溢路径”报告

## Customer-Facing Rules

- 不在正文、表头、附注或对话中出现 `api_ref`、`api_id`、`MCP`、参数名、分页、`result_ref`、`JSONPath`。
- 不对客户说“接口失败”“未授权”“路由不存在”“字段缺失”；改写成“当前可核验公开资料有限”或“该维度公开信息暂未完整显示”。
- 未发现风险，不等于不存在风险；必须写清证据边界。
- 风险事件不能单独证明关系成立；关系线索也不能单独证明风险必然传导。
- 所有结论都必须区分“已确认传导链”“较强传导信号”“弱传导线索”“当前证据不足”。

## Internal Workflow

### 1. Resolve And Lock The Target Entity

- 先调用 `qxb_op_enterprise_resolve` 确认目标中国企业主体。
- 后续统一使用确认后的企业全称或统一社会信用代码，不默认传 `eid`。
- 首次调用每个接口前，先用 `qxb_op_api_spec_get` 确认真实参数名，不猜参数。

### 2. Build A Two-Layer Baseline Snapshot

先完成两个总览，再进入深挖：

1. 风险总览  
   优先用：
   - `cn_company_risk_statistics` (`27.59`)
   - `cn_company_related_info_summary` (`93.17`)

2. 画像总览  
   优先用：
   - `cn_customer_due_diligence` (`47.51`)

如果需要快速判断“关联圈体量是否足够大到值得继续穿透”，优先看：

- `glqy_count` 关联企业数
- `bgjl_count` 实际控制企业数
- `sysyl_count` 受益所有人数
- `related_risk` 关联风险数

### 3. Build The Related-Entity Pool First

不要一上来就对几十个主体逐个拉风险明细。先构造“关联主体候选池”，再筛出重点样本。

优先来源：

1. 股权与控制
   - `cn_company_actual_controllers` (`55.5`)
   - `cn_company_beneficial_owners` (`55.3`)
   - `cn_company_invested_enterprises` (`77.76`)
   - `cn_company_controlled_companies` (`33.13`)

2. 集团与体系
   - `cn_company_group_graph` (`61.45`)
   - `cn_company_group_members` (`31.29`) 按需使用，当前环境可能返回 `105 未授权`
   - `cn_customer_due_diligence` (`47.51`) 的 `group_info`、`invest_list`、`branches_list`

3. 人物外部网络
   - `cn_company_key_personnel` (`1.45`)
   - `cn_executive_insight` (`51.17`)
   - `cn_personnel_external_positions` (`59.5`)

4. 弱关系与辅助线索
   - `cn_company_contact_info` (`1.51`)
   - `cn_company_same_phone_entities` (`62.1`)
   - `cn_company_suspected_related_parties` (`33.9`)

### 4. Rank Relationship Strength Before Risk Reading

把关联关系先分层，再决定风险传导权重：

- 强关系：直接控股、间接控制链、实际控制人一致、受益人高度一致、集团图谱直连
- 中关系：参股控股、关键高管深度交叉、人物外部任职/投资与主体形成稳定链条
- 弱关系：同电话、疑似关联方、联系方式/地址/域名重合

报告中默认：

- 强关系主体可以进入“核心传导主体”
- 中关系主体进入“重点观察主体”
- 弱关系主体进入“辅助观察主体”

### 5. Pull Risk In Layers

对候选池不要全量明细扫描。按以下顺序取数：

1. 聚合风险  
   优先用 `cn_cooperation_risk_scan` (`55.29`)  
   先看 preview，再用 `qxb_op_result_query` 钻取目标块。

2. 人物关联企业风险  
   对关键人物优先用 `cn_executive_insight` (`51.17`) 的：
   - `risk_info`
   - `related_enterprise_risk_info`

3. 明细风险  
   仅对重点样本补明细，优先：
   - `cn_company_executed` (`17.5`)
   - `cn_company_dishonest_executed` (`5.5`)
   - `cn_company_high_consumption_restrictions` (`66.1`)
   - `cn_company_termination_cases` (`67.1`)
   - `cn_company_equity_freezes` (`34.1`)
   - `cn_company_judicial_assistance` (`40.2`)
   - `cn_company_judicial_auctions` (`7.1`)
   - `cn_company_abnormal_operations` (`1.55`)
   - `cn_company_serious_illegal` (`56.1`)
   - `cn_company_tax_arrears` (`20.1`)
   - `cn_company_major_tax_illegal` (`20.3`) 如需要重大税务违法

### 6. Judge Propagation Instead Of Dumping Risks

每条风险都要回答 3 件事：

1. 风险主体与目标主体是什么关系。
2. 风险能否沿该关系链传导。
3. 传导强度高、中、低的依据是什么。

优先使用以下传导判断口径：

- 高传导：目标企业直接控股/实控的关联主体出现执行、失信、限高、冻结、破产、重大处罚等硬风险。
- 中传导：关键人物深度绑定的关联主体出现持续司法或经营风险，且该人物在目标企业处于关键控制/决策岗位。
- 低传导：弱关联主体出现零散风险，或强关联主体只见轻微、历史、已解除风险。
- 暂不判断：只有关系，没有风险；或只有风险，没有足够关系证据。

### 7. Use Conservative Report Conclusions

结论默认分四档：

- 高传导风险
- 中传导风险
- 低传导风险
- 当前证据不足

不要因为关联圈很大就自动写高风险，也不要因为目标主体本身干净就忽略关联圈风险。

## Required References

执行时按需阅读：

- [references/api-map.md](./references/api-map.md)
- [references/analysis-contract.md](./references/analysis-contract.md)
- [references/report-template.md](./references/report-template.md)
- [references/pdf-delivery.md](./references/pdf-delivery.md)

## Output Contract

- Markdown 工作稿：`[企业简称]_关联企业传导风险报告_[YYYY-MM-DD].md`
- PDF 正式件：`[企业简称]_关联企业传导风险报告_[YYYY-MM-DD].pdf`

默认优先交付 PDF。

## Internal Tooling Notes

- `31.29` 集团成员接口在当前环境实测可能返回 `status 105 / 未授权调用该接口`，因此只能作为可选补充，不能作为主路径依赖。
- `61.45` 集团图谱当前环境可用，可作为集团关系主替代。
- 聚合接口 `47.51`、`55.29`、`51.17` 应先看 preview，再用 `qxb_op_result_query` 按 JSONPath 精确钻取，不要直接把全量结果灌进正文。
- 先做“候选池筛选”，再做“重点样本明细”，避免无差别逐个企业扫风险。
