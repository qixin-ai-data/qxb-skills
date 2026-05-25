# 接口与最简调用路径

本 skill 以“少调用、少重复、够判断”为原则，服务于合作前风险速查场景。

## 默认调用顺序

### 1. 主体确认

- 工具：`qxb_op_enterprise_resolve`
- 目的：确认企业主体，识别重名、别名、历史名称和歧义
- 默认输入：`keyword`

没有主体确认，就不要进入自动放行结论。

### 2. 主速查

- API：`cn_cooperation_risk_scan`
- API ID：`55.29`
- 目的：一次性查看合作前最常见的风险模块，如诉讼、裁判文书、执行、限高、处罚、欠税、异常经营等风险信号
- 默认输入：`keyword`

默认先读取：

- `preview.section_summary`
- `preview.highlighted_sections`
- `result_ref`

只有在预览不足时，才继续按 `result_ref` 做块级查询。

## 推荐读取方式

### 优先看总览

先根据 `preview.section_summary` 判断：

- 命中了哪些风险模块
- 哪些模块没有命中
- 哪些模块需要进一步展开

### 只展开命中的重点块

若需要补充证据，优先用 `qxb_op_result_query` 查询命中的模块，不要无差别展开所有块。

已知可优先关注的路径包括：

- `$.data.ent_info`
- `$.data.judgement_list[0:5]`
- `$.data.enforcement_list[0:5]`
- `$.data.restricted_consumer_list[0:5]`
- `$.data.administrative_punishment_list[0:5]`
- `$.data.overduetaxs_list[0:5]`

如果某条路径不存在，不要猜字段名，回到总览判断，或按需查接口规格。

## 唯一推荐兜底接口

### `cn_company_registration_face`

- API ID：`1.41`
- 用途：补企业名称、统一社会信用代码、法定代表人、登记状态、成立日期、经营范围等基础工商字段

仅在以下情况使用：

- 聚合结果没有给出清晰的主体基础信息
- 需要确认企业是否 `注销`、`吊销`、`存续`
- 聚合结果与用户提供信息冲突

## 不建议默认展开的接口

以下接口虽然可用，但在本 skill 中不应默认逐个调用：

- `cn_company_abnormal_operations`
- `cn_company_serious_illegal`
- `cn_company_dishonest_executed`
- `cn_company_executed`
- `cn_company_administrative_penalties`
- `cn_company_case_filing`
- `cn_company_hearing_notices`
- `cn_company_court_announcements`
- `cn_company_tax_arrears`
- `cn_company_major_tax_illegal`

只有在用户明确要求深挖某一风险维度，或者聚合结果不足以支持关键判断时，才按需补查。

## 参数规则

- 已知参数足够明确时，直接调用，不要为了形式反复查询 spec。
- 仅在以下情况调用 `qxb_op_api_spec_get`：
  - 记不清参数名
  - 接口返回提示参数错误
  - 怀疑当前接口规格已变化
