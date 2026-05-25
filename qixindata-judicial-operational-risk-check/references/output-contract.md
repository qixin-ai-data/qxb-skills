# 输出契约

本文用于约束 `qixindata-judicial-operational-risk-check` 的最终产物格式。

默认输出一份结果：
1. 简版 Markdown 报告

仅当用户明确要求 `结构化结果`、`JSON`、`机器可读摘要` 时，再额外输出：
2. 结构化 JSON 摘要

## Markdown 报告结构

默认使用以下章节顺序：

```md
# 企业司法与经营风险体检报告

## 1. 报告头部信息
## 2. 体检结论总览
### 2.1 企业基本情况
### 2.2 风险等级与合作建议
### 2.3 重点风险提示
## 3. 司法风险体检
## 4. 处罚与合规体检
## 5. 经营异常与经营风险体检
## 6. 关联方风险提示
## 7. 数据缺口与说明
## 8. 信息来源说明
```

## Markdown 写作规则

- 保持简版报告风格，默认不写成长篇全景尽调
- 每个模块先给一句结论
- 有实质命中时，再写结果摘要与代表性记录
- 无命中时，保留一句结论即可
- `重点风险提示` 只保留真正影响合作判断的问题
- 对司法模块，先判断案件身份结构；如果以原告/申请人维权类案件为主，不要仅凭案件数量上调风险
- 正文不出现任何接口名、参数名、技术字段或抓取过程描述
- 代表性记录优先保留最近、金额最高、影响最大、最能说明风险模式的 3 到 8 条

## 模块展开口径

### 司法风险体检

至少说明：
- 近一年、近三年或历史范围内是否命中
- 主要命中类型，如被执行、开庭、立案、限高、冻结、拍卖、破产
- 公司在案件中的身份结构，是以原告/申请人为主，还是以被告/被申请人为主
- 是否出现连续司法压力或进入执行阶段
- 是否足以影响合作稳定性

如样本中以原告/申请人身份的维权类案件为主，推荐在摘要中明确写出：
- `司法记录存在一定数量，但以主动维权案件为主，未见明显执行承压信号。`

代表性记录优先字段：
- 时间
- 案号
- 身份
- 案由/事项
- 法院/执行机关
- 金额或结果

### 处罚与合规体检

至少说明：
- 是否命中行政处罚、环保处罚、严重违法、产品投诉/召回等
- 命中次数、时间分布和是否重复
- 处罚机关或认定来源
- 是否体现持续性合规压力

代表性记录优先字段：
- 时间
- 风险类型
- 机关/来源
- 结果
- 金额或核心事实

### 经营异常与经营风险体检

至少说明：
- 是否命中经营异常、欠税、非正常户、重大税收违法、资产负担等
- 命中时间、次数、当前状态
- 是否影响持续经营或履约稳定性

代表性记录优先字段：
- 时间
- 风险类型
- 机关/来源
- 结果/状态
- 金额、标的或核心对象

### 关联方风险提示

只保留：
- 关联主体名称
- 该主体为当前存续公司
- 与目标企业的关系
- 如存在高风险命中，再补充风险类型、时间或代表性事件

## JSON 摘要结构

JSON 优先保证稳定结构，仅在用户明确要求时输出：

```json
{
  "meta": {
    "report_type": "qxb_judicial_operational_risk_check",
    "generated_at": "ISO-8601",
    "snapshot_scope": "current",
    "entity_input": "用户输入名称",
    "entity_name": "解析后的企业全称"
  },
  "overview": {
    "composite_risk_score": 0,
    "composite_risk_rating": "",
    "justice_risk_score": 0,
    "risk_level": "",
    "cooperation_recommendation": ""
  },
  "modules": {
    "basic_info": {},
    "judicial_risk": {
      "summary": "",
      "highlights": [],
      "items": []
    },
    "compliance_risk": {
      "summary": "",
      "highlights": [],
      "items": []
    },
    "operational_risk": {
      "summary": "",
      "highlights": [],
      "items": []
    },
    "related_party_risk": {
      "summary": "",
      "core_related_parties": [],
      "direct_related_risks": [],
      "strong_transmission_risks": []
    }
  },
  "high_risk_hits": [],
  "data_gaps": [],
  "source_refs": []
}
```

## JSON 填充规则

- `overview` 只放总览层关键信息
- `cooperation_recommendation` 保持既有字段，不新增其他决策字段
- `judicial_risk`、`compliance_risk`、`operational_risk` 为本 skill 的核心模块
- `summary` 用 1 到 2 句话概括
- `highlights` 用于记录最值得上会或复核的点
- `items` 只保留代表性记录，不复制全量原始数据
- `source_refs` 仅用于结构化追溯，不进入 Markdown 正文

## 信息来源说明写法

如保留末尾来源说明章节，简短列出本次实际调用过的 MCP 接口名即可，例如：
- 主体解析：`qxb_op_enterprise_resolve`
- 风险总览：`cn_cooperation_risk_scan`
- 综合评分：`cn_company_composite_risk`
- 司法评分：`cn_company_justice_risk`
- 基础尽调：`cn_customer_due_diligence`

写法要求：
- 只列本次实际调用过的接口，不预列未调用接口
- 保持简短，一般 3 到 6 行即可
- 可以写接口名，必要时可附一两个中文用途短语
- 不展开参数名、`api_id`、`api_ref`、JSONPath、`result_ref` 或缓存引用
