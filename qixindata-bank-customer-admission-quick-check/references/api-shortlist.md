# API Shortlist

首次调用不熟悉的接口前，先用 `qxb_op_api_spec_get` 确认参数和返回字段。

## 主体解析

| Tool or API | Purpose | Typical input |
| --- | --- | --- |
| `qxb_op_enterprise_resolve` | 解析企业主体并识别重名或歧义 | `keyword` |

## 基础信息

| API | API ID | Purpose | Primary input |
| --- | --- | --- | --- |
| `cn_company_registration_face` | `1.41` | 核心工商照面，获取企业名称、统一社会信用代码、法定代表人、登记状态、成立日期、经营范围 | `keyword` |
| `cn_company_registration_report` | `1.8` | 补充工商报告、历史沿革、变更、异常项目等 | `keyword` |
| `cn_company_contact_info` | `1.51` | 联系电话、邮箱、地址等存在性线索 | `keyword` |
| `cn_customer_due_diligence` | `47.51` | 聚合尽调补充，只用于交叉验证和兜底 | `keyword` |

## 重点风险维度

| API | API ID | Purpose | Primary input |
| --- | --- | --- | --- |
| `cn_company_abnormal_operations` | `1.55` | 经营异常记录 | `keyword` |
| `cn_company_serious_illegal` | `56.1` | 严重违法失信相关记录 | `name` |
| `cn_company_dishonest_executed` | `5.5` | 失信被执行记录 | `keyword` |
| `cn_company_executed` | `17.5` | 被执行记录 | `name` |
| `cn_company_administrative_penalties` | `32.1` | 行政处罚记录 | `keyword` |
| `cn_company_tax_arrears` | `20.1` | 欠税记录 | `name` |
| `cn_company_major_tax_illegal` | `20.3` | 重大税收违法记录 | `name` |
| `cn_company_equity_freezes` | `34.1` | 股权冻结记录 | `name` |
| `cn_company_deregistration_records` | `36.53` | 注销备案或相关退出信号 | `keyword` |

## 聚合兜底

| API | API ID | Purpose | Primary input |
| --- | --- | --- | --- |
| `cn_cooperation_risk_scan` | `55.29` | 快速预览合作风险板块，用于查漏补缺，不作为唯一阻断依据 | `keyword` |

## 建议调用顺序

1. `qxb_op_enterprise_resolve`
2. `cn_company_registration_face`
3. `cn_company_contact_info`
4. 按重点风险维度逐项查询
5. 仅在需要补充或交叉验证时调用 `cn_customer_due_diligence` 或 `cn_cooperation_risk_scan`
