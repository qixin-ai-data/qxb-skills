# MCP Playbook

## Default Sequence

1. `qxb_op_enterprise_resolve`
2. `qxb_op_api_spec_get` for each new `api_ref`
3. Core factual blocks for the brief report
4. Optional aggregate or deep-dive blocks
5. Normalize into six dimensions before writing

## Brief Bundle

优先用最小但足够的接口组合拼出“背景、股权、管理、经营、风险”五个块，不要一上来把所有接口全部跑完。

| Block | Default api_ref | Why it matters |
| --- | --- | --- |
| 主体锚点 | `cn_company_registration_face`, `cn_company_registration_report`, `cn_company_triple_codes` | 确认企业全称、统一社会信用代码、状态、法定代表人、注册地址 |
| 背景画像 | `cn_company_contact_info`, `cn_company_industry_nec`, `cn_company_scale`, `cn_company_entity_nature`, `cn_company_capital_background`, `cn_company_profile`, `cn_company_main_business` | 补齐行业、规模、主体性质、资本背景、业务描述 |
| 股权与控制 | `cn_company_shareholders_ic`, `cn_company_equity_change`, `cn_company_beneficial_owners`, `cn_company_actual_controllers` | 看股东结构、控制口径、股权稳定性 |
| 管理层 | `cn_company_key_personnel` | 看法定代表人、董事、监事、高管与角色集中度 |
| 历史沿革 | `cn_company_change_records`, `cn_company_historical_names`, `cn_company_branches` | 看名称、地址、法代、经营范围变化和分支情况 |
| 集团与外部布局 | `cn_company_outbound_investments`, `cn_company_group_members`, `cn_company_controlled_companies` | 看集团化程度和对外扩张 |
| 经营辅助信息 | `cn_company_domains`, `cn_company_certificates`, `cn_company_annual_report_websites` | 看官网域名、资质证照、年报网站等经营支持信息 |
| 风险概览 | `cn_company_risk_statistics`, `cn_company_credit_score`, `cn_company_composite_risk`, `cn_company_shell_index`, `cn_company_contract_default_index`, `cn_company_justice_risk` | 先拿可横向比较的风险总览 |
| 重点风险 | `cn_company_abnormal_operations`, `cn_company_serious_illegal`, `cn_company_administrative_penalties`, `cn_company_tax_arrears`, `cn_company_major_tax_illegal`, `cn_company_executed`, `cn_company_dishonest_executed`, `cn_company_case_filing`, `cn_company_hearing_notices`, `cn_company_high_consumption_restrictions` | 补齐会影响合作、投资或采购判断的关键负面事项 |
| 舆情 | `cn_company_news`, `cn_company_news_detail` | 补充近期公开负面或重大事件 |

## Formal Expansion

正式版在简版基础上再扩，不是平铺直叙地重复事实。

| Goal | Recommended api_ref |
| --- | --- |
| 强化集团与关联链 | `cn_company_group_graph`, `cn_company_invested_enterprises`, `cn_company_group_investments`, `cn_company_group_investors` |
| 强化关键人物观察 | `cn_executive_insight`, `cn_personnel_external_positions` |
| 强化经营许可和经营线索 | `cn_company_administrative_licenses`, `cn_company_recruitment`, `cn_company_import_export`, `cn_company_taxpayer_type` |
| 强化财务线索 | `cn_company_financial_key_indicators`, `cn_company_cash_flow_statements`, `cn_company_income_statements`, `cn_company_balance_sheets` |
| 强化合作或供应链视角 | `cn_company_suppliers`, `cn_company_customers`, `cn_company_supply_chain`, `cn_company_bidding_list` |
| 强化风险细目 | 结合司法、税务、股权负担、破产清算等细分接口按需展开 |

## Aggregate Interfaces

### `cn_customer_due_diligence`

- 适合快速兜底企业背景、集团、历史、资质、域名等块。
- 当用户要“先给我一版全景简报”时，可优先拿它做骨架，再回填关键单项接口。
- 不要把聚合接口当成唯一事实来源；遇到控制链、风险等级等关键结论，仍要用单项接口交叉核验。

### `cn_cooperation_risk_scan`

- 适合快速形成合作前风险扫描骨架。
- 当只关心特定风险块时，优先用 `dimension` 缩小返回范围。
- 对重点命中的诉讼、执行、处罚、欠税，再补单项接口。

### `cn_executive_insight`

- 适合围绕法定代表人、董事长、总经理等关键人物做第二层观察。
- 需要同时提供企业和人物姓名，不能只传企业名。

## Result Query Pattern

- 聚合接口结果大时，先看 preview。
- 只有需要某一块展开时，再用 `qxb_op_result_query` 精确钻取。
- 不要把 `result_ref`、`JSONPath` 或返回结构暴露给用户。

## Default Stop Conditions

- 主体未锁定，不写全景结论。
- 风险总览和关键负面块明显冲突时，先降级表述为“公开信息口径存在差异”。
- 简版完成后默认暂停，询问是否继续正式版。
