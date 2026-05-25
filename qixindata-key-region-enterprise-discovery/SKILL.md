---
name: qixindata-key-region-enterprise-discovery
description: 使用启信宝国内企业 MCP，在园区、开发区、重点区域锚点或产业带候选范围内发现并排序最值得关注的 A 类企业。适用于区域销售、行业研究、招商、渠道拓展或区域经营团队需要围绕某个园区、开发区、周边锚点企业、城市产业带或候选企业名单筛出重点企业、输出 A 类白名单、优先跟进名单或区域企业发现排序时使用；也适用于用户已提供候选企业名单，希望结合区域归属、行业匹配、规模、标签、科创、可触达性与风险做区域优先级发现。
---

# Qixin Cn Key Region Enterprise Discovery

## Overview

围绕“某个区域里哪些企业最值得优先关注”构建稳定的批量发现流程。先通过园区、开发区、周边锚点或用户给定名单拿到一批候选企业，再做批量补全、分层和 A 类筛选，最后输出重点企业清单、候补名单和人工复核项。

优先处理这类请求：

- “帮我找苏州工业园区最值得跟进的 A 类企业”
- “在合肥高新区筛一批重点企业，给区域销售先跑”
- “围绕长三角新能源产业带，先找出最值得关注的企业”
- “我已经有一批候选企业，帮我筛出区域内更值得关注的 A 类客户”

主交付必须是批量结果，不是单家企业报告。单家企业只允许出现在两种位置：

- 作为 `周边发现` 的地理锚点
- 作为批量结果中的单个样本做补充说明

如果用户只想“批量找企业名单”而不需要 A 类排序，优先切到 `$qixin-enterprise-batch-search`。如果用户已经有候选名单且重点是客户优先级排序而非区域发现，也可以切到 `$qixin-cn-customer-priority-ranking`。

## Safety Boundaries

- 只做只读查询、发现、评分、排序和建议，不写回 CRM、白名单系统、监控系统或底层业务库。
- 把结果表述为“重点关注建议”或“A 类发现建议”，不要写成授信审批、准入放行、投资结论或法律意见。
- 不把单家企业深挖当成默认交付；默认交付应是区域企业清单、A 类名单和候补名单。
- 首次调用任一接口前，先用 `qxb_op_api_spec_get` 看参数说明，不猜参数名。
- 不在用户可见输出中暴露 `api_ref`、`api_id`、`result_ref`、JSONPath 或原始技术报错。
- 只处理中国主体，优先通过 `qxb_op_enterprise_resolve` 确认企业主体，不直接猜企业全称。
- 若用户只给“城市”或“产业带”但没有园区、开发区、锚点企业、坐标或候选名单，不要伪装成可直接全域扫企；应明确说明当前 MCP 没有通用的城市级企业总入口，并要求补充可执行锚点。

## Choose The Discovery Route

按固定顺序选择入口，不要自由发挥：

1. 用户明确给出 `开发区 / 经开区 / 高新区 / 产业开发区` 时，走开发区入口。
2. 用户明确给出 `园区 / 产业园 / 科技园 / 保税区` 时，走园区入口。
3. 用户明确给出 `周边 / 附近 / X 公里 / 某企业周边` 时，走周边入口。这里的单家企业只是地理锚点，最终仍要返回一批企业。
4. 用户已提供候选企业名单时，直接进入候选池评分。
5. 用户只给 `城市 / 产业带` 时，只能在其同时提供园区、开发区、锚点企业、坐标或候选名单时继续；否则先收窄范围。

具体路由和接口组合见 [references/mcp-route-map.md](./references/mcp-route-map.md)。

## Normalize The Request

先把用户请求整理成稳定的内部对象，再调用 MCP：

```json
{
  "discovery_mode": "park|zone|nearby|provided-list|city-or-belt-decomposition",
  "region_anchor": "",
  "anchor_enterprise": "",
  "city_scope": [],
  "industry_keywords": [],
  "status_required": ["存续", "在业"],
  "preferred_labels": [],
  "preferred_entity_natures": [],
  "preferred_scales": [],
  "capital_range": null,
  "whitelist_size": 10,
  "scenario": "regional-sales|industry-research|bank-rm",
  "notes": []
}
```

遵守这些默认值：

- 用户没有给白名单人数时，默认取 `max(5, min(20, round(valid_candidates * 0.2)))`。
- 用户没有给经营状态时，默认优先 `存续 / 在业`。
- 用户没有说要分支、门店、营业部时，默认优先独立企业主体。
- 用户出现 `银行 / 开户 / 授信 / 存款 / 票据 / 现金管理` 等语义时，把 `scenario` 切到 `bank-rm`，可补查商机线索。
- 用户是研究团队且更关注“区域重点样本”而不是“立即拜访”，可降低可触达性权重，但不要忽略风险与区域一致性。

## Prime The MCP Specs Once

开始执行前，先一次性读取本轮会用到的接口规格，避免边查边猜。优先参考 [references/mcp-route-map.md](./references/mcp-route-map.md)。

至少先看这几组规格：

- 候选池入口：`cn_industrial_park_companies`、`cn_development_zone_companies`、`cn_nearby_company_search`、`cn_nearby_company_count`、`cn_nearby_company_detail`
- 基础补全：`cn_company_registration_face`、`cn_company_concept_labels`、`cn_company_scale`、`cn_company_entity_nature`、`cn_company_contact_info`
- 条件确认：`cn_company_main_business`、`cn_company_industry_nec`、`cn_company_above_scale`、`cn_company_sme`
- 质量与风险：`cn_company_composite_risk`、`cn_company_justice_risk`
- 创新与增长：`cn_company_tech_innovation_score`、`cn_company_tech_innovation_composite_score`
- 银行或商机语义下再补：`cn_company_commercial_clues`

## Build The Candidate Pool

按入口先拿候选企业，再做规范化去重：

1. 通过园区、开发区、周边锚点或用户名单拿到候选企业。
2. 用统一社会信用代码优先去重；缺失时再用规范化企业全称去重。
3. 默认剔除明显的非正常经营主体、已注销主体和明显分支样本。
4. 园区、开发区或周边命中的企业，后续要用工商照面和联系地址复核区域一致性。
5. 候选量大于 100 时，先做轻量预排，再建议用户收窄，不要默认对全部样本跑重接口。

## Enrich And Verify Candidates

对全量候选先做轻量补全，对头部和边界样本再做增强验证：

- 全量优先补：工商照面、概念标签、企业规模、主体性质、综合风险。
- 行业主题明确时，补查主营业务或国民经济行业分类。
- 用户明确关心规上、小微、主体性质时，再补查对应接口，不要无差别全查。
- 对头部候选和边界样本补查：联系方式、司法风险、科创评分、科创综合评分。
- 只有当用户存在银行拓客或明确商机语义时，才补查营销商机线索。

如果区域一致性、主体层级或关键字段存在冲突，降级到 `待人工确认`，不要硬判 A 类。

## Score The A-Class Candidates

按固定评分模型输出 `A / B / C / 排除 / 待人工确认`。详细口径见 [references/scoring-framework.md](./references/scoring-framework.md)。

评分前先执行硬性否决：

- 企业主体无法确认，或同名冲突无法排除。
- 经营状态为注销、吊销、撤销、清算等非正常存续。
- 用户要独立企业主体，但样本明显是分公司、营业部、门店或其他分支。
- 区域入口命中，但工商地址已明显迁出目标区域且用户关注的是“当前可经营区域名单”。
- 风险明显偏高，且司法或综合风险出现重负面信号。

A 类建议用于“最值得优先关注”的企业，不要把“仅信息缺失但看起来不错”的样本直接放进 A 类。

## Write The Output

默认按 [references/output-template.md](./references/output-template.md) 输出，至少包含：

1. 发现范围与执行口径
2. 结果概览
3. A 类重点企业清单
4. 候补与待人工确认
5. 企业发现总表
6. 下一步建议

写作约束：

- 用业务语言解释“为什么值得重点关注”，不要暴露底层接口名。
- 把“区域命中”“行业匹配”“规模/标签”“科创或商机”“风险情况”拆开写，不用一句模糊的“优质企业”代替。
- 证据不足时写“当前可核信息不足以进入 A 类”，不要把“没查到”写成“没有”。
- 结果很多时，先给 A 类和前 N 名摘要，再说明其余样本已完成预排。

## Internal Tooling Rules

- 先 `qxb_op_enterprise_resolve`，再 `qxb_op_api_spec_get`，最后 `qxb_op_api_call`。
- 传参优先使用企业全称、统一社会信用代码、园区名、开发区名或坐标，不传 eid。
- 周边接口若需要经纬度过滤，先确认规格再调用，不猜 POST 参数名。
- 聚合型大结果优先看 preview；确需精确字段时再用 `qxb_op_result_query`，不要整段展开。
- 只用查询类接口，不调用写操作、监控管理或名单维护能力。

## References

- 区域发现入口与接口节奏：[references/mcp-route-map.md](./references/mcp-route-map.md)
- A 类评分与硬性否决规则：[references/scoring-framework.md](./references/scoring-framework.md)
- 用户可见输出模板：[references/output-template.md](./references/output-template.md)
