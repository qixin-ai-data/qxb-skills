# MCP Playbook

在需要调用底层启信宝 MCP、确定接口顺序或处理聚合结果时读取本文件。

## Always-On Rules

- 从企业名称、简称、统一社会信用代码、注册号出发时，先做 `qxb_op_enterprise_resolve`。
- 第一次调用某个新接口前，先做 `qxb_op_api_spec_get`。
- 国内企业查询优先传正式企业全称、统一社会信用代码或注册号，不要猜 `eid`。
- 同一轮比选里，所有候选企业优先走同一条基础接口链路。
- 聚合接口只在基础接口不足或需要打破平局时启用；先看 preview，再按需用 `qxb_op_result_query` 钻取。

## Core API Shortlist

- `cn_company_registration_face` (`1.41`, 参数 `keyword`)
作用：核正式名称、统一社会信用代码、法定代表人、注册资本、经营状态、成立日期、经营范围。

- `cn_company_triple_codes` (`79.34`, 参数 `name`)
作用：补统一社会信用代码、组织机构代码、注册号，用于主体强标识交叉确认。

- `cn_company_industry_nec` (`79.13`, 参数 `name`)
作用：获取国民经济行业分类，便于对齐行业口径。

- `cn_company_concept_labels` (`44.82`, 参数 `name`, 可选 `type_id`)
作用：获取概念标签、企业类型、风险特征、科技认定等标签，适合做业务匹配或画像比较。

- `cn_company_scale` (`79.12`, 参数 `name`)
作用：获取大型/中型/小型/微型等规模分类。

- `cn_company_entity_nature` (`91.66`, 参数 `keyword`)
作用：获取主体性质，如民营、央企、地方国企、事业单位、个体等。

- `cn_company_capital_background` (`79.11`, 参数 `name`)
作用：获取资本背景或企业性质，用于判断股东或资本侧画像。

- `cn_company_contact_info` (`1.51`, 参数 `keyword`)
作用：获取地址、电话、邮箱等联系方式，适合作为公开可核资料完整度的辅助证据。

- `cn_company_certificates` (`22.1`, 参数 `name`, 可选 `type`, `skip`)
作用：获取资质证书、编号和有效期，适合采购或准入场景。

- `cn_company_administrative_licenses` (`39.2`, 参数 `name`, 可选 `skip`)
作用：获取行政许可、编号、有效期与机关信息。

- `cn_company_administrative_penalties` (`32.1`, 参数 `keyword`, 可选 `skip`)
作用：获取行政处罚记录、处罚机关、处罚决定日期、处罚金额和没收违法所得金额，适合输出处罚明细表。

- `cn_company_environmental_penalties` (`51.1`, 参数 `name`, 可选 `skip`)
作用：获取环保处罚记录、处罚类型、处罚日期和机关信息，适合补环境合规专项风险。

- `cn_company_abnormal_operations` (`1.55`, 参数 `keyword`, 可选 `skip`)
作用：获取经营异常记录，适合作为基础风险底线检查。

- `cn_company_serious_illegal` (`56.1`, 参数 `name`)
作用：获取严重违法失信相关记录，适合作为人工升级或阻断信号。

- `cn_branch_parent_check` (`79.18`, 参数 `name`)
作用：当候选主体是分公司、营业部、支行、门店时，反查所属总公司，统一比较层级。

- `cn_customer_due_diligence` (`47.51`, 参数 `keyword`, 可选 `dimension`, `is_history`)
作用：聚合尽调接口，适合在投资初筛、平局打破或需要集团/分支/域名/上市等摘要时使用。

- `cn_cooperation_risk_scan` (`55.29`, 参数 `keyword`, 可选 `dimension`, `is_history`)
作用：聚合风险接口，适合在需要更全面的合作风险轮廓时使用。

## Recommended Base Route

对每家候选企业，优先走这条基础链路：

1. `qxb_op_enterprise_resolve`
2. `cn_company_registration_face`
3. `cn_company_triple_codes`
4. `cn_company_industry_nec`

只有在主体确认完成后，才开始补标签、规模、资质或风险维度。

## Recommended Route By Scenario

### 商务合作

路线：
`企业解析 -> 工商照面 -> 三码 -> 行业分类 -> 概念标签 -> 联系方式 -> 经营异常/严重违法`

适合回答：

- 谁更适合商务优先跟进
- 哪家主体更稳、业务更匹配
- 哪家有明显基础风险

### 采购/供应商

路线：
`企业解析 -> 工商照面 -> 三码 -> 规模 -> 主体性质 -> 资本背景 -> 资质信息 -> 行政许可 -> 行政处罚 -> 经营异常/严重违法`

适合回答：

- 谁更适合进入供应商下一轮
- 哪家资质准备度更好
- 哪家主体和风险底线更稳

如果用户明确要求看处罚日期、金额、处罚机关或决定书文号，优先直接调用 `cn_company_administrative_penalties`，不要只依赖聚合风险摘要。

### 投资初筛

路线：
`企业解析 -> 工商照面 -> 三码 -> 行业分类 -> 概念标签 -> 规模 -> 资本背景 -> 客户信息尽调 preview -> 合作风险排查 preview`

适合回答：

- 谁更值得继续见面或进一步看
- 哪家画像更完整
- 哪家风险轮廓更轻

### 通用合作

路线：
`企业解析 -> 工商照面 -> 三码 -> 行业分类 -> 概念标签 -> 规模 -> 经营异常/严重违法`

适合回答：

- 用户没有明确场景时的快速排序

## Comparison-Specific Rules

- 同一轮里，不要只对某一家企业加做大量补充接口；如果需要补，就对所有仍在比较范围内的企业一起补。
- 如果只有个别候选企业命中了额外数据，而其他企业没有同等维度，优先把该维度放进备注，而不是直接影响总分。
- 如果用户给了明确硬门槛，例如“必须有某类资质”，再把该维度升级为闸门并对所有候选统一核验。
- 工具异常导致个别企业字段缺失时，标记为 `待核验`，并在信息完整度中反映，不要直接当作负项。
- 用户要求“列处罚表/资质表/许可表”时，读取 [evidence-table-templates.md](./evidence-table-templates.md) 并按固定列名输出。

## Aggregate Query Patterns

只在聚合接口场景下参考：

- `$.data.ent_info`
作用：企业基础档案摘要

- `$.data.group_info`
作用：集团和母子关系摘要

- `$.data.listed_info`
作用：上市相关摘要

- `$.data.domain_list[0:10]`
作用：域名和网站摘要

- `$.data.branches_list[0:10]`
作用：分支机构摘要

- `$.data.financing_list[0:10]`
作用：融资历史摘要

- `$.data.judgement_list[0:10]`
作用：裁判文书摘要

- `$.data.enforcement_list[0:10]`
作用：被执行摘要

- `$.data.administrative_punishment_list[0:10]`
作用：行政处罚摘要

## Fallback Strategy

- 基础接口已经足够完成排序时，停止扩查。
- 候选主体仍不清晰时，优先补强线索，不要继续堆弱证据。
- 候选超过 10 家时，先做一轮预筛，避免逐家深查导致比较失衡。
- 如果用户最终想要的是某一家企业的全面尽调，而不是横向比选，及时切到更合适的深度报告 skill。
