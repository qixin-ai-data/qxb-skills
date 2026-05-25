---
name: qixindata-customer-recommendation
description: 使用启信宝国内企业 MCP 能力，对重点客户名单做主体核验、关系扩展和商机扫描，识别客户本体、子公司、集团成员或同实控企业中的跨境、开户、授信和业务交叉机会，并输出可跟进的机会清单。适用于客户经理、对公团队、跨境团队或产品团队已拿到 Excel、CSV、TSV、文本名单或 CRM 导出的重点客户列表，希望判断“这些客户及其关联主体里是否出现了新的机会”时使用；尤其适合只掌握少量内部字段、但想快速发现新增开户、授信、跨境和子公司覆盖机会的场景。
---

# Key Account Opportunity Mining

## Overview

围绕“重点客户及其关联主体里有没有新的业务机会”构建稳定流程。先确认重点客户主体，再按一层关系展开到子公司、集团成员或同实控企业，随后用启信宝 MCP 扫描跨境、开户、授信和业务交叉信号，最后输出高优先级机会清单，而不是长篇研究报告。

## Safety Boundaries

- 只做只读查询、机会识别、排序和建议，不写回 CRM、名单系统、审批系统或外呼系统。
- 把输出表述为“机会清单”“跟进建议”或“潜在商机”，不要写成授信审批、准入放行、法律意见或最终营销决策。
- 不把联系人手机号、身份证号、会议纪要、CRM 敏感备注、未脱敏交易明细等敏感信息写入 skill 自带文件、示例或缓存素材。
- 外部数据未覆盖到的字段统一写成 `未核验` 或 `待人工确认`，不要把“未查到”改写成“没有”。
- 当重点客户主体冲突、关联关系不清、分支层级混入或风险证据矛盾时，降级到 `待人工确认`，不要强行给出 A 类机会。
- 首次调用任一 Qixin API 前先用 `qxb_op_api_spec_get` 看参数说明，不猜参数名。
- 不在用户可见输出中暴露 `api_ref`、`api_id`、`result_ref`、`JSONPath` 或原始技术报错。

## Choose The Right Entry Path

- 用户已经提供重点客户名单或 CRM 导出表，希望判断“有没有新的开户、授信、跨境或交叉销售机会”时，直接进入本 skill。
- 用户还没有重点客户名单，而是想“先找一批潜在客户”，先切到 `$qixin-enterprise-batch-search` 生成候选池，再回到本 skill。
- 用户只想看单家企业的全面尽调或正式报告时，优先切到 `$qixin-cn-enterprise-detail-report` 或更深的风险类 skill，不要把当前任务扩写成单家深度报告。
- 用户只是想对一批存量客户做“谁更值得优先拜访/增额”的综合排序，而不是找新增机会时，优先切到 `$qixin-cn-customer-priority-ranking`。

## Normalize The Request

先把请求整理成稳定的内部对象，再开始调用 MCP：

```json
{
  "scenario": "bank-rm|generic-b2b",
  "input_mode": "key-account-list",
  "expand_scope": "self-and-affiliates",
  "focus_products": ["cross-border", "account-opening", "credit", "cross-sell"],
  "known_current_products": false,
  "allow_branch_entities": false,
  "top_n": 20,
  "user_notes": []
}
```

执行时遵守这些默认值：

- 如果用户提到 `银行`、`对公`、`开户`、`授信`、`跨境`、`结算`、`存款`、`票据`、`保理`、`供应链金融` 等语义，切到 `bank-rm`；否则默认 `generic-b2b`。
- 如果用户没有指定关注产品，默认同时扫描 `跨境`、`开户`、`授信` 和 `业务交叉`。
- 如果用户没有指定是否展开关联主体，默认展开 `重点客户本体 + 直接参股控股企业 + 集团成员`。
- 如果用户没有给“当前已合作产品”，仍然允许扫描商机，但所有“产品缺口”相关结论要降级为 `潜在机会`，不要写成已验证的覆盖缺口。
- 表格字段映射、别名归并和缺失值规则统一参考 [references/input-schema.md](./references/input-schema.md)。

## Prepare The Anchor Account List

先做重点客户名单规范化，不要一边查询一边临时改口径：

1. 从 Excel、CSV、TSV、文本表格或粘贴名单中提取重点客户企业全名、统一社会信用代码和可用的内部备注。
2. 每家重点客户先用 `qxb_op_enterprise_resolve` 做主体确认，再进入后续查询。
3. 优先用 `creditNo` 去重；没有统一社会信用代码时，再用规范化企业全名去重。
4. 默认保留独立企业主体；名称明显包含 `分公司`、`分支机构`、`营业部`、`门店` 且用户未明确要分支客群时，降级到 `待人工确认` 或剔除。
5. 工商状态为 `注销`、`吊销`、`撤销`、`清算` 等非正常存续时，不作为重点客户本体继续扩展。
6. 如果用户给了“当前已合作产品”，先标准化成统一的产品词表，例如 `开户`、`结算`、`授信`、`跨境`、`票据`、`保理`、`供应链金融`。

## Expand To Opportunity Entities

先确认重点客户，再向外扩一层，不做无限递归。固定路由和用法参考 [references/mcp-route-map.md](./references/mcp-route-map.md)。

默认扩展顺序：

1. 重点客户本体。
2. `cn_company_invested_enterprises`：直接参股控股企业，用于发现未覆盖子公司或控股实体。
3. `cn_company_group_members`：集团成员，用于发现集团内的新增覆盖机会。
4. `cn_company_controlled_companies`：同实控企业，仅在用户明确接受同实控拓展或集团关系不完整时补充。

扩展时遵守这些规则：

- 默认只扩一层，不对子公司继续递归展开到二级子公司。
- 默认剔除非正常存续主体和明显分支机构。
- 如果单个重点客户展开出的关联主体过多，先保留状态正常、关系清晰、便于跟进的前 20 个主体，再做机会扫描。
- 输出中必须标清 `机会主体` 与 `重点客户` 的关系，不允许把子公司机会写成母公司本体机会。

## Scan Opportunity Signals

先对重点客户本体和展开出的机会主体做轻量信号扫描，再只对高优先级机会做深挖验证。

### Core Signal Routes

默认优先使用这些接口：

- `cn_company_registration_face`：统一主体、经营状态、注册资本、法定代表人、经营范围。
- `cn_company_contact_info`：判断是否便于触达。
- `cn_company_main_business`：判断主营方向是否适配跨境、开户、授信或其他产品。
- `cn_company_commercial_clues`：识别开户、授信、存款、拓客等商机线索。
- `cn_company_import_export`：识别进出口、跨境结算或贸易融资机会。
- `cn_company_supply_chain`、`cn_company_customers`、`cn_company_suppliers`：识别上下游生态、供应链金融和业务交叉切入点。
- `cn_company_composite_risk`：做轻量风险约束。

### Map Signals To Opportunity Types

把商机信号稳定映射到这四类机会：

- `跨境机会`：出现进出口备案、外贸相关业务、海外业务迹象，或主营/标签能支持跨境结算、外汇、贸易融资。
- `开户机会`：客户本体或关联主体存在开户/拓客线索，且当前产品覆盖里未出现开户或结算。
- `授信机会`：出现授信、融资、保理、票据、应收账款、招投标活跃或供应链融资信号，且风险可控。
- `业务交叉机会`：当前已合作产品有限，但主营、上下游、供应链或集团结构显示仍有其他产品切入口。

如果缺少当前产品覆盖信息：

- 可以识别 `潜在开户机会`、`潜在跨境机会`、`潜在授信机会`、`潜在交叉销售方向`。
- 不要把“当前未覆盖”写成已经确认的事实。

## Validate Only The Top Opportunities

把重查询留给最值得跟进的机会主体：

1. 先基于轻量信号拿到预排序。
2. 对高优先级机会调用 `cn_customer_due_diligence`，补集团、资质、域名、融资或经营佐证。
3. 对拟进入 A 类机会清单的主体调用 `cn_cooperation_risk_scan`，确认没有明显高风险拦截项。
4. 如需增强机会证据，优先补 `cn_company_bidding_list`、`cn_company_supply_chain`、`cn_company_import_export` 等信号。
5. 如果重接口结果显示高风险、主体不一致或关系不成立，回退到 `B`、`C` 或 `待人工确认`。
6. 如果聚合结果很大，优先看 preview，再用 `qxb_op_result_query` 按块取数，不要整段展开给用户。

## Score And Prioritize Opportunities

按固定口径做“商机优先级”排序，不再沿用“存量客户深挖”的重内字段模式。详细口径见 [references/scoring-framework.md](./references/scoring-framework.md)。

机会总分使用这个公式：

```text
opportunity_score =
  anchor_value_score +
  relation_proximity_score +
  signal_strength_score +
  product_gap_score +
  execution_readiness_score -
  risk_penalty
```

其中：

- `anchor_value_score`：`0-20`，衡量重点客户本体的体量、地位、战略价值。
- `relation_proximity_score`：`0-15`，衡量机会主体与重点客户的关系远近，本体和直接子公司高于集团泛成员。
- `signal_strength_score`：`0-30`，衡量跨境、开户、授信、业务交叉相关外部信号强弱。
- `product_gap_score`：`0-20`，衡量用户提供的当前合作产品与机会类型之间是否存在明确缺口；缺少当前产品信息时，这部分只能保守给分。
- `execution_readiness_score`：`0-15`，衡量是否便于触达、是否已有归属客户经理、下一步动作是否清晰。
- `risk_penalty`：`0-30`，风险越高扣分越重。

把结果稳定映射到这些等级：

- `A`：`opportunity_score >= 70`，机会类型明确，证据足够，风险可控。
- `B`：`55-69`，机会存在，但需要再补 1-2 个关键信息点。
- `C`：`40-54`，只有弱信号，建议观察。
- `排除`：`< 40`，或命中硬性否决项。
- `待人工确认`：主体冲突、关系不清、缺少关键字段或风险证据矛盾。

## Use The Standard Opportunity Record

每条机会在内部至少整理成如下结构，再生成用户可见内容：

```json
{
  "anchor_account": "",
  "target_entity": "",
  "relation_type": "self|subsidiary|group-member|same-controller",
  "status": "",
  "current_products": [],
  "opportunity_types": ["cross-border", "account-opening", "credit", "cross-sell"],
  "opportunity_score": 0,
  "priority_class": "A|B|C|排除|待人工确认",
  "evidence": [],
  "risk_notes": [],
  "manual_review_notes": []
}
```

不要把这个内部对象原样暴露给用户；它只是为了保持跨任务复现性。

## Write The Output

默认按 [references/output-template.md](./references/output-template.md) 的结构输出，正文优先保持成 4 段：

1. `一句话结论`
2. `优先跟进名单`
3. `其他可跟进线索`
4. `待人工确认`

只有在用户明确要求导出明细或按产品线拆表时，再补 `完整机会清单` 或 `按机会类型分组`。

输出时遵守这些约束：

- 先给结论和名单，再给解释，不要先堆企业背景。
- 每条机会必须写清楚 `重点客户`、`机会主体`、`关系类型`、`机会类型`、`推荐理由`、`建议动作`。
- 如果机会来自子公司、集团成员或同实控企业，必须明确写出关系，不要模糊成“客户本体机会”。
- 缺少当前产品覆盖信息时，统一写 `当前仅识别到潜在机会`，不要写成“已确认产品未覆盖”。
- 对风险明显偏高的主体，要直接降级或排除，不要因为有商机信号就强推。
- 正文默认不要同时出现多张大表；如果已经给了 `优先跟进名单`，其余内容尽量压缩成 1 张表或几条短句。
- 用户要求导出文件时，优先导出 Markdown 表格、CSV 或 Excel；处理电子表格时可配合 `$Excel` skill，但不要因为没有 Excel 就阻塞结论输出。

## Internal Tooling Rules

- 先用 `qxb_op_enterprise_resolve` 确认重点客户主体，再调企业接口，不猜企业全称。
- 第一次调用某个接口前必须先跑 `qxb_op_api_spec_get`。
- 传参优先使用企业全称、统一社会信用代码或注册号，不传 `eid`。
- 默认只做一层关系扩展，不递归到二级、三级子公司。
- 商机扫描优先轻量接口，尽调和聚合风险只用于高优先级机会主体。
- 用户没有给“当前已合作产品”时，不要假装知道产品覆盖缺口，只能输出潜在机会。
- 如果请求的关键工作其实是“对现有客户做综合优先级排序”，及时切到 `$qixin-cn-customer-priority-ranking`。
- 如果用户只要正式尽调报告，不要在本 skill 里堆成长报告，切到相应报告型 skill。

## References

- MCP 路由与关系扩展节奏：[references/mcp-route-map.md](./references/mcp-route-map.md)
- 商机优先级评分与机会映射：[references/scoring-framework.md](./references/scoring-framework.md)
- 输入字段映射与精简输入规则：[references/input-schema.md](./references/input-schema.md)
- 用户可见输出模板：[references/output-template.md](./references/output-template.md)
