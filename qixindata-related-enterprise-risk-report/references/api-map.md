# API Map

本文汇总“关联企业传导风险”最关键的 MCP、接口、参数和字段。

## MCP Layer

主流程只需要以下 MCP 能力：

- `qxb_op_enterprise_resolve`
  作用：解析中国企业主体，锁定规范企业全称。

- `qxb_op_api_spec_get`
  作用：首次调用接口前确认真实参数名与字段。

- `qxb_op_api_call`
  作用：调用具体接口。

- `qxb_op_result_query`
  作用：对 `47.51`、`55.29`、`51.17` 这类聚合结果按 JSONPath 精准钻取。

## Core Routes

### 1. 目标主体与风险总览

| api_ref | api_id | 主要参数 | 关键字段 | 用途 |
| --- | --- | --- | --- | --- |
| `cn_company_risk_statistics` | `27.59` | `keyword` | `risk`, `related_risk`, `judicial_risk`, `manage_risk` | 先判断自身风险与关联风险体量 |
| `cn_company_related_info_summary` | `93.17` | `name` | `total_count`, `glqy_count`, `bgjl_count`, `sysyl_count`, `swyc_count`, `sfpm_count`, `pcaj_count` | 快速判断关联圈规模与若干风险计数 |
| `cn_customer_due_diligence` | `47.51` | `keyword`, `dimension?`, `is_history?` | `ent_info`, `group_info`, `contract_info`, `employees_list`, `invest_list`, `actual_controller_info`, `benefit_list`, `branches_list` | 建立主体画像和第一层关联圈 |

### 2. 关系识别主接口

| api_ref | api_id | 主要参数 | 关键字段 | 用途 |
| --- | --- | --- | --- | --- |
| `cn_company_actual_controllers` | `55.5` | `name` | `entityName`, `totalPercent`, `nodes`, `links` | 锁定实控人和控制路径 |
| `cn_company_beneficial_owners` | `55.3` | `keyword` | `beneficiary`, `percent`, `paths`, `reason`, `type` | 锁定受益所有人和受益路径 |
| `cn_company_invested_enterprises` | `77.76` | `keyword`, `skip`, `pname?` | `invest_name`, `invest_status`, `invest_percent`, `direct_percent`, `invest_level`, `invest_relationship_path` | 找参股控股链条和被投资主体 |
| `cn_company_controlled_companies` | `33.13` | `name` | `ename`, `pname`, `percent` | 找同实控圈企业 |
| `cn_company_group_graph` | `61.45` | `keyword` | `group_name`, `group_number`, `statistics`, `nodes` | 当前环境可用的集团主路径 |
| `cn_company_group_members` | `31.29` | `name`, `skip` | `items[].name`, `legal_person`, `regist_capi`, `status` | 集团成员补充；当前环境实测可能 `105 未授权` |
| `cn_company_suspected_related_parties` | `33.9` | `name` | `name`, `relation_type`, `evidence` | 疑似关联线索补充 |
| `cn_company_contact_info` | `1.51` | `keyword` | `address`, `telephone`, `email` | 为同电话/地址类辅助关系做源数据 |
| `cn_company_same_phone_entities` | `62.1` | `phone` | `name`, `credit_no`, `regist_capi`, `start_date` | 同电话反查企业 |

### 3. 人物外部网络

| api_ref | api_id | 主要参数 | 关键字段 | 用途 |
| --- | --- | --- | --- | --- |
| `cn_company_key_personnel` | `1.45` | `keyword`, `skip?` | `items[].name`, `items[].title`, `items[].is_history` | 锁定关键人物名单 |
| `cn_executive_insight` | `51.17` | `keyword`, `p_name`, `dimension?`, `is_history?` | `basic_info`, `risk_info`, `related_enterprise_risk_info` | 最强人物视角聚合接口 |
| `cn_personnel_external_positions` | `59.5` | `company`, `name` | `oper_info[]`, `invest_info[]`, `manager_info[]` | 查询指定人物对外任职/投资 |

### 4. 风险聚合与补明细

| api_ref | api_id | 主要参数 | 关键字段 | 用途 |
| --- | --- | --- | --- | --- |
| `cn_cooperation_risk_scan` | `55.29` | `keyword`, `dimension?`, `is_history?` | 聚合多块风险 sections | 重点风险聚合扫描 |
| `cn_company_executed` | `17.5` | `name`, `skip?` | `case_number`, `court`, `case_date`, `amount`, `status` | 被执行 |
| `cn_company_dishonest_executed` | `5.5` | `keyword`, `skip?` | `case_number`, `court`, `publish_date`, `amount`, `execution_status` | 失信被执行 |
| `cn_company_high_consumption_restrictions` | `66.1` | `ename`, `pname?` | 限高相关字段 | 限制高消费 |
| `cn_company_termination_cases` | `67.1` | `keyword`, `skip?` | `case_no_terminal`, `terminate_date`, `fail_perform_amount` | 终本案件 |
| `cn_company_equity_freezes` | `34.1` | `keyword`, `skip?` | `executive_court`, `amount`, `start_date`, `end_date` | 股权冻结 |
| `cn_company_judicial_assistance` | `40.2` | `keyword`, `skip?` | 司法协助相关字段 | 资产受限补证 |
| `cn_company_judicial_auctions` | `7.1` | `name`, `skip?` | `date`, `full_name`, `start_price` | 司法拍卖 |
| `cn_company_abnormal_operations` | `1.55` | `keyword`, `skip?` | `in_reason`, `in_date`, `out_reason`, `out_date` | 经营异常 |
| `cn_company_serious_illegal` | `56.1` | `name` | `execution[]` | 严重违法失信 |
| `cn_company_tax_arrears` | `20.1` | `name`, `skip?` | `overdue_type`, `overdue_amount`, `curr_overdue_amount`, `pub_department` | 欠税 |
| `cn_company_major_tax_illegal` | `20.3` | 首次使用前务必查 spec | 重大税务违法相关字段 | 补重大税收违法 |

## Aggregate Query Patterns

### `47.51` 客户信息尽调

常用 JSONPath：

- `$.data.ent_info`
- `$.data.group_info`
- `$.data.contract_info`
- `$.data.employees_list[0:20]`
- `$.data.invest_list[0:20]`
- `$.data.actual_controller_info`
- `$.data.benefit_list[0:10]`
- `$.data.branches_list[0:20]`
- `$.data.domain_list[0:20]`

### `55.29` 合作风险排查

常用 JSONPath：

- `$.data.ent_info`
- `$.data.judgement_list[0:20]`
- `$.data.enforcement_list[0:20]`
- `$.data.executions_list[0:20]`
- `$.data.restricted_consumer_list[0:20]`
- `$.data.terminationcaseitem_list[0:20]`
- `$.data.judicial_freeze_list[0:20]`
- `$.data.auctions_list[0:20]`
- `$.data.abnormal_list[0:20]`
- `$.data.serious_illegal_list[0:20]`
- `$.data.administrative_punishment_list[0:20]`
- `$.data.overduetaxs_list[0:20]`
- `$.data.bankruptcy_list[0:20]`

### `51.17` 董监高信息洞察

常用 JSONPath：

- `$.data.basic_info`
- `$.data.basic_info.oper_list[0:20]`
- `$.data.basic_info.stockholder_list[0:20]`
- `$.data.basic_info.manager_list[0:20]`
- `$.data.basic_info.investment_list[0:20]`
- `$.data.basic_info.actual_controller_list[0:20]`
- `$.data.risk_info`
- `$.data.related_enterprise_risk_info`

## Practical Notes

### 已验证可用

- `27.59`
- `93.17`
- `47.51`
- `55.29`
- `55.5`
- `55.3`
- `77.76`
- `61.45`
- `62.1`
- `51.17`
- `59.5`
- `33.13`

### 当前环境需降级处理

- `31.29` 当前实测返回：`status 105 / 未授权调用该接口`

因此集团成员不要单点依赖，优先用：

1. `61.45` 集团图谱
2. `47.51` 的 `group_info`、`invest_list`、`branches_list`
3. `77.76` / `33.13` 补集团内核心主体
