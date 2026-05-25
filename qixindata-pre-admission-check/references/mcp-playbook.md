# MCP Playbook

在需要底层接口路由、参数差异、聚合接口钻取或准入裁决依据时再读取本文件。

## Always-On Rules

- 从企业名称、简称、曾用名、统一社会信用代码或注册号出发时，先做 `qxb_op_enterprise_resolve`。
- 第一次调用某个新接口前，先做 `qxb_op_api_spec_get`。
- 国内企业查询优先传正式企业全称、统一社会信用代码或注册号，不要猜 `eid`。
- 先做细粒度核验，只有信息冲突、线索不足或用户明确要求时才升到聚合接口。
- 聚合接口返回大结果时，先看 preview，再按需用 `qxb_op_result_query` 局部钻取。

## Core API Shortlist

- `cn_company_registration_face` (`1.41`, 参数 `keyword`)
作用：核正式名称、统一社会信用代码、法定代表人、注册资本、经营状态、成立日期、经营范围。

- `cn_company_triple_codes` (`79.34`, 参数 `name`)
作用：补齐统一社会信用代码、组织机构代码、注册号；适合做主体强标识交叉确认。

- `cn_company_contact_info` (`1.51`, 参数 `keyword`)
作用：核地址、电话、邮箱等联系方式；适合判断“公开可核资料”是否齐全。

- `cn_branch_parent_check` (`79.18`, 参数 `name`)
作用：用分支名称反查总公司；适合处理“应核总公司还是分支”。

- `cn_company_branches` (`1.49`, 参数 `keyword`, `skip`)
作用：从总公司向下核分支；适合确认某分支是否真实隶属于目标主体。

- `cn_company_historical_names` (`24.28`, 参数 `keyword`, `skip`)
作用：核曾用名；适合处理旧营业执照、旧合同、历史品牌线索。

- `cn_company_change_records` (`1.47`, 参数 `keyword`, `skip`, `type_code`)
作用：解释名称、地址、联系方式、负责人、分支变化。
常用 `type_code`：
`1` 名称变更
`5` 地址变更
`6` 联系方式变更
`8` 负责人变更
`11` 分支机构变更

- `cn_company_migration` (`79.26`, 参数 `name`, `skip`)
作用：核迁移历史；适合处理旧地址和异地迁址争议。

- `cn_company_domains` (`16.1`, 参数 `name`)
作用：核备案域名和网站名称；适合用官网、域名、备案信息辅助确认主体。

- `cn_company_annual_report_websites` (`1.53`, 参数 `keyword`, `skip`)
作用：核年报网址；适合补充网站、网址类型和审核时间信号。

- `cn_company_certificates` (`22.1`, 参数 `name`, `skip`, 可选 `type`)
作用：核企业资质证书及有效期；适合判断基础准入材料是否覆盖关键资质。

- `cn_company_administrative_licenses` (`39.2`, 参数 `name`, `skip`)
作用：核行政许可及有效期；适合处理行业准入、经营许可、备案许可类要求。

- `cn_company_financial_qualifications` (`79.24`, 参数 `name`)
作用：核金融资质和牌照；适合金融、支付、保险、基金等牌照型准入场景。

- `cn_company_abnormal_operations` (`1.55`, 参数 `keyword`, `skip`)
作用：核经营异常记录；适合把它作为放行前的基础阻断检查之一。

- `cn_company_serious_illegal` (`56.1`, 参数 `name`)
作用：核严重违法失信相关记录；适合作为硬性升级人工复核信号。

- `cn_customer_due_diligence` (`47.51`, 参数 `keyword`, 可选 `dimension`, `is_history`)
作用：在主体仍有歧义，或需要一次性查看基础档案、集团、分支、域名、资质等多个板块时作为聚合兜底。
建议：先看 preview，再局部钻取。

- `cn_cooperation_risk_scan` (`55.29`, 参数 `keyword`, 可选 `dimension`, `is_history`)
作用：在需要顺带判断是否存在明显阻断风险时做聚合风险排查。
建议：优先用 `dimension` 缩小范围，避免默认全量展开。

## Recommended Route By Question

- `企业是不是这家真实存续主体`
路线：`企业解析 -> 工商照面 -> 三码 -> 联系方式`

- `申请主体是分支还是总公司`
路线：`分支所属总公司核查 -> 工商照面 -> 必要时总公司分支列表`

- `旧名称、旧地址、旧官网是不是同一家`
路线：`工商照面 -> 历史名称 -> 变更记录 -> 迁移情况 -> 域名/年报网址`

- `资料够不够进下一步`
路线：`工商照面 -> 联系方式 -> 域名/年报网址 -> 资质/行政许可`

- `有没有明显阻断项`
路线：`工商照面 -> 经营异常 -> 严重违法 -> 必要时合作风险排查`

- `需要一次性看多个板块但又不想全量堆接口`
路线：`客户信息尽调 -> preview -> qxb_op_result_query 按块下钻`

## Aggregate Query Patterns

只在使用聚合接口时参考：

- `$.data.ent_info`
作用：企业基础档案

- `$.data.group_info`
作用：集团和母子关系摘要

- `$.data.domain_list[0:10]`
作用：域名信息摘要

- `$.data.branches_list[0:10]`
作用：分支机构摘要

- `$.data.listed_info`
作用：上市信息摘要

- `$.data.enforcement_list[0:10]`
作用：被执行信息摘要

- `$.data.administrative_punishment_list[0:10]`
作用：处罚信息摘要

## Gate-Oriented Interpretation

- 工商照面状态正常，只能说明“公开工商状态仍在存续”；不等于全部准入条件已满足。
- 经营异常、严重违法、许可缺失，不要直接替用户做监管判断；要写成“需要人工复核”或“当前不建议进入下一步”的原因。
- 没有查到资质或许可，不等于法律上绝对没有；应写“当前公开可核信息未见”，并提醒按用户制度补件或人工复核。
- 联系方式、官网、域名属于辅助验证项，不能压过统一社会信用代码、注册号和主体层级判断。

## Fallback Strategy

- 基础工商信息足够确认主体时，停止扩查。
- 多个候选仍接近时，优先补一个更强线索，而不是继续堆弱证据。
- 用户只关心“能不能下一步”时，不要自动扩写成长篇深度报告。
