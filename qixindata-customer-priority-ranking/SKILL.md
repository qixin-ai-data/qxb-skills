---
name: qixindata-customer-priority-ranking
description: 使用启信宝国内企业 MCP 能力，对一批中国企业做银行对公客户优先级排序，识别更值得客户经理优先经营的 A 类企业白名单。适用于银行对公客户经理、公司金融团队、授信审查前筛选、开户与结算拓客、票据与现金管理营销等场景；当用户已经拿到一批候选企业名单，希望围绕开户、综合授信、流贷、票据、保函、结算、现金管理、供应链金融等机会做优先拜访排序时使用。
---

# Qixin CN Customer Priority Ranking

## Overview

围绕“银行客户经理这周先跑谁、先做哪类对公业务切入”做标准化排序。先统一候选客户池和银行业务口径，再用轻量企业画像做全量初排，只对头部或边界样本做深挖，最终输出：

- `本周优先拜访名单`
- `A 类正式白名单`
- `候补名单`
- `完整排序结果`

## Safety Boundaries

- 只做只读查询、评分、排序和建议，不写回 CRM、白名单系统、信贷系统、审批系统或任何业务底库。
- 把结果表述为“对公营销优先级建议”或“客户经营排序建议”，不要写成授信审批意见、准入结论、放款承诺、法律意见或最终业务决策。
- 不把联系人手机号、邮箱、客户经理内部备注、会议纪要、内部成交概率等敏感信息写入 skill 自带文件、示例或缓存素材。
- 无法确认主体、经营状态、关键字段或风险结论时，降级到 `待人工确认`，不要强行给出 `A 类正式白名单`。
- 首次调用任一接口前，先用 `qxb_op_api_spec_get` 查看参数说明，不猜参数名。
- 不在用户可见输出中暴露 `api_ref`、`api_id`、`result_ref`、`JSONPath` 或原始技术报错。

## Choose The Entry Path

- 用户已经提供企业名单、表格或文本客户池时，直接进入排序流程。
- 用户还没有客户池，但明确要“先找一批对公客户再排序”时，先用 `$qixin-enterprise-batch-search` 生成候选企业池，再回到本 skill 做排序。
- 用户只想看单家企业的深度尽调、合作风险或完整企业报告时，切到 `$qixin-cn-enterprise-detail-report`，不要把当前任务扩写成单家深度报告。

## Normalize The Request

先把用户请求整理成稳定的内部对象，再开始调用 MCP：

```json
{
  "scenario": "bank-rm",
  "candidate_mode": "provided-list|build-pool",
  "candidate_count": 0,
  "whitelist_size": 5,
  "target_regions": [],
  "target_industry_keywords": [],
  "preferred_entity_natures": [],
  "preferred_labels": [],
  "preferred_scales": [],
  "preferred_banking_products": [],
  "must_have_signals": [],
  "knockout_rules": [],
  "user_notes": []
}
```

执行时遵守这些默认值：

- 默认按 `bank-rm` 口径处理，不再默认走通用 B2B 销售口径。
- 如用户没给白名单人数，默认取 `max(5, min(20, round(valid_candidates * 0.2)))`。
- 如用户没给明确产品线，默认围绕这些对公业务机会排序：
  - `开户`
  - `综合授信`
  - `流动资金贷款`
  - `项目贷款`
  - `银行承兑汇票`
  - `票据池/贴现`
  - `保函/信用证`
  - `结算与现金管理`
  - `代发`
  - `供应链金融`
- 如用户没给主体偏好，默认优先 `存续/在业`、`独立企业主体`、`中大型/规上`、`标签清晰`、`可触达`、`风险可控` 的企业。
- 如用户明确目标客群是小微、园区企业、分支机构或某类细分客群，覆盖默认偏好，不要机械压低这类主体。

## Prefer Natural-Language Input

优先接受自然语言输入，不要求用户先整理成字段表或 JSON。这个 skill 的职责之一，就是把客户经理口语化需求翻译成稳定的内部排序对象。

常见自然语言信号这样理解：

- `帮我筛一下本周先拜访哪几家对公客户` -> 触发对公客户优先级排序
- `重点看开户、授信、存款、票据、现金管理机会` -> 映射到银行产品偏好
- `想先找综合授信和结算沉淀空间更大的客户` -> 强化授信与结算价值权重
- `分公司先别放进正式名单` -> 映射到独立主体优先与分支剔除规则
- `风险高的先不要进正式白名单` -> 映射到风险约束和硬性否决
- `先给我 5 家本周重点拜访名单，再补候补名单` -> 输出正式白名单和候补名单

整理自然语言请求时，优先抽取这些语义：

- `目标动作`：本周优先拜访、筛白名单、给候补名单、做完整排序
- `候选范围`：用户给的企业名单，或需要先生成客户池
- `银行产品`：开户、综合授信、流贷、项目贷、银承、贴现、保函、信用证、结算、现金管理、代发、供应链金融
- `偏好约束`：区域、行业、主体、规模、标签、可触达性、风险约束
- `节奏要求`：本周先跑、优先看前 5 家、重点经营 A 类
- `输出要求`：要正式白名单、完整排序表、客户经理拜访建议

## Prime The MCP Specs Once

在真正批量跑企业前，先把本轮会用到的底层接口规格一次性取回，避免边查边猜参数名。优先参考 [references/mcp-execution-playbook.md](./references/mcp-execution-playbook.md)。

推荐至少先批量查看这些接口规格：

- 全量初排：`cn_company_registration_face`、`cn_company_concept_labels`、`cn_company_scale`、`cn_company_entity_nature`、`cn_company_contact_info`、`cn_company_composite_risk`
- 银行业务补强：`cn_company_main_business`、`cn_company_above_scale`、`cn_company_sme`、`cn_company_commercial_clues`
- 头部深挖：`cn_customer_due_diligence`、`cn_cooperation_risk_scan`

执行时固定遵守这些底层规则：

- 先 `qxb_op_enterprise_resolve`，再 `qxb_op_api_spec_get`，最后才 `qxb_op_api_call`。
- 不混用参数名。当前已知路由里，`registration_face`、`entity_nature`、`contact_info`、`composite_risk`、`above_scale`、`sme`、`commercial_clues`、`customer_due_diligence`、`cooperation_risk_scan` 优先传 `keyword`；`concept_labels`、`scale`、`main_business` 优先传 `name`。
- 聚合接口优先先看 preview 或摘要；需要精确字段时再用 `qxb_op_result_query`，不要把大结果整段摊开。

## Resolve And Deduplicate Candidates

先做候选企业规范化，不要一边查一边临时改口径：

1. 从表格、文本或候选列表中提取企业全名、统一社会信用代码、注册号等强标识。
2. 对每个候选主体先做 `qxb_op_enterprise_resolve`，确认是中国企业主体，再进入后续查询。
3. 用 `creditNo` 优先去重；没有统一社会信用代码时，再用规范化企业全名去重。
4. 默认保留独立企业主体；名称明显包含 `分公司`、`分支机构`、`营业部`、`门店` 且用户没有明确要分支客群时，降到 `待人工确认` 或剔除。
5. 经营状态为 `注销`、`吊销`、`撤销`、`清算` 等非正常存续时，直接进入排除名单，不参与 A 类白名单。

## Enrich The Candidate Pool

对全量候选企业先做轻量补充，再对头部样本做深挖。优先使用 [references/mcp-route-map.md](./references/mcp-route-map.md) 中的固定路由。

对所有候选企业默认补这些信息：

- `cn_company_registration_face`：企业名称、统一社会信用代码、法定代表人、注册资本、经营状态、成立日期、经营范围
- `cn_company_concept_labels`：高新、专精特新、上市、规上、外贸等标签
- `cn_company_scale`：大型、中型、小型、微型
- `cn_company_entity_nature`：央企、地方国企、民营、事业单位、个体等主体性质
- `cn_company_contact_info`：地址、电话、邮箱等可触达信息
- `cn_company_composite_risk`：综合风险分与风险等级
- `cn_company_main_business`：主营产品和业务方向，用于判断和银行对公产品的匹配度
- `cn_company_commercial_clues`：优先识别授信、开户、结算、项目建设、融资、票据、存款沉淀等商机线索

按条件追加补充：

- `cn_company_above_scale`：需要确认规上企业时再查
- `cn_company_sme`：需要确认普惠或小微客群时再查
- `cn_customer_due_diligence`：对头部候选补集团关系、资质、域名、融资等增强证据
- `cn_cooperation_risk_scan`：对拟进入 A 类正式白名单的企业做重风险复核

控制查询规模：

- 候选企业 `<= 20` 家时，可对全部样本做轻量补充，并对前 10 家做深挖
- 候选企业 `21-100` 家时，对全部样本做轻量补充，只对前 `10-15` 家或边界样本做深挖
- 候选企业 `> 100` 家时，先输出预排序和收窄建议，不默认对所有样本跑重接口

## Run The Ranking Pipeline

把排序流程固定成下面这个顺序，不要跳步：

1. 整理用户名单，抽取企业名称、统一社会信用代码、注册号和用户指定偏好。
2. 对每个候选企业先做 `qxb_op_enterprise_resolve`，拿到规范主体后再进入查询。
3. 批量查询全量轻量画像，形成初始评分底表。
4. 按固定评分框架输出预排序，并标出 `A/B/C/排除/待人工确认`。
5. 仅对 `A` 类候选和高分 `B` 类做尽调与合作风险深挖。
6. 根据深挖结果回调总分、白名单标记和人工复核项。
7. 最终同时输出 `本周优先拜访名单`、`A 类正式白名单`、`候补名单` 和 `完整排序结果`。

## Score With The Fixed Model

按固定结构打分，不临时改维度。详细分值口径见 [references/scoring-framework.md](./references/scoring-framework.md)。

总分公式：

```text
total_score = fit_score + value_score + banking_signal_score + reachability_score - risk_penalty
```

其中：

- `fit_score`：`0-30`，衡量区域、行业、主体性质、标签与用户目标客群是否匹配
- `value_score`：`0-25`，衡量规模、规上、成长性、集团属性、资金沉淀和综合金融价值空间
- `banking_signal_score`：`0-25`，衡量近期是否出现适合银行切入的信号，例如开户、授信、项目建设、融资、票据、存款、结算、现金管理、供应链金融
- `reachability_score`：`0-10`，衡量电话、邮箱、地址、官网等是否便于触达
- `risk_penalty`：`0-30`，综合风险越高、重风险越多，扣分越重

把结果稳定映射到这几档：

- `A`：`total_score >= 75`，`fit_score >= 18`，无硬性否决项，且核心字段基本齐全
- `B`：`60-74`，或总分达到 A 但存在 1 个关键字段待确认
- `C`：`40-59`，有一定价值，但暂不建议优先经营
- `排除`：`< 40`，或命中硬性否决项
- `待人工确认`：主体冲突、分支层级不清、关键数据缺失或证据互相矛盾

白名单生成规则固定如下：

- 默认只把 `A` 类企业放进 `A 类正式白名单`
- 如果 `A` 类数量不足，不要把 `C` 类补进正式白名单；只允许把高分 `B` 类作为 `候补名单` 单独列出
- 如果用户强制要固定数量的白名单，明确标注哪些是 `正式白名单`，哪些只是 `候补补位`
- 如果 `A` 类企业较多，按 `total_score` 排序后截取前 `whitelist_size` 家进入正式白名单，其余 `A` 类仍保留在完整排序结果中
- 如果 `A` 和 `B` 分界很近，优先检查 `risk_penalty` 和关键字段完整度，不要只看总分

## Banking-Focused Interpretation

解释企业价值时，优先使用银行业务名词，不要只说“商机好”或“价值高”。

优先从这些角度组织理由：

- `开户切入`
- `综合授信切入`
- `流贷/项目贷机会`
- `银承、票据池、贴现机会`
- `保函、信用证、国际结算机会`
- `结算沉淀与现金管理机会`
- `代发与供应链金融机会`
- `集团客户延展机会`

一句话理由尽量写成这种结构：

- `区域匹配 + 制造业龙头 + 近期授信信号明确 + 结算沉淀空间较大 + 风险可控`
- `项目建设活跃 + 开户与资金归集机会清晰 + 可触达性好 + 需补一轮风险复核`

## Deepen Only The Top Candidates

把深挖能力用在最值钱的样本上，不要全量铺开：

1. 先根据轻量分数得到预排序。
2. 对 `A` 类候选和高分 `B` 类调用 `cn_customer_due_diligence`，补足集团、资质、域名、融资等佐证。
3. 对拟进 `A 类正式白名单` 的企业调用 `cn_cooperation_risk_scan`，确认没有明显重风险。
4. 如果重接口结果显示高风险、主体不一致或证据不足，回退到 `B`、`C` 或 `待人工确认`。
5. 如需从聚合结果中精确读取字段，使用 `qxb_op_result_query` 按块读取，不把超大结果整段展开给用户。

## Use The Standard Record Shape

对每家企业内部统一整理为如下结构，再做排序：

```json
{
  "name": "",
  "credit_no": "",
  "status": "",
  "entity_nature": "",
  "scale": "",
  "labels": [],
  "contact_available": false,
  "fit_score": 0,
  "value_score": 0,
  "banking_signal_score": 0,
  "reachability_score": 0,
  "risk_penalty": 0,
  "total_score": 0,
  "priority_class": "A|B|C|排除|待人工确认",
  "whitelist_flag": "正式白名单|候补名单|观察|排除",
  "recommended_products": [],
  "evidence": [],
  "notes": []
}
```

不要把这个内部对象原样暴露给用户；它只用于保持跨任务复现性。

## Write The Output

默认按 [references/output-template.md](./references/output-template.md) 的结构输出，至少包含这五部分：

1. `排序依据`
2. `结果概览`
3. `A 类正式白名单`
4. `完整排序结果`
5. `待人工复核与下一步营销动作`

输出时遵守这些约束：

- 排序依据里写清楚本次使用的是 `bank-rm` 口径。
- 解释每家企业时，优先用短句串联银行证据，例如 `大型制造企业 + 近期综合授信信号 + 结算沉淀空间 + 风险等级可控`。
- 把“价值空间大”和“风险可控”分开写，不要用一句模糊的“优质客户”替代。
- 证据不足时写 `当前可核信息不足以进入 A 类正式白名单`，不要写成 `没有价值`。
- 结果很多时，先给 `本周优先拜访名单` 和 `A 类正式白名单`，再附完整排序摘要。
- 用户要求导出文件时，优先导出 CSV 或 Markdown 表格；环境明确支持电子表格处理时，再考虑 Excel。

## Internal Tooling Rules

- 优先用 `qxb_op_enterprise_resolve` 确认主体，不直接猜企业全称。
- 第一次调用某个接口前必须先跑 `qxb_op_api_spec_get`。
- 传参优先使用企业全称、统一社会信用代码或注册号，不传 `eid`。
- 排序阶段优先使用轻量接口；只有头部样本需要补强证据时才进入聚合尽调与风险排查。
- 只使用查询类接口，不调用任何写操作、审批流或名单维护能力。
- 如果本轮请求的关键工作是“批量找企业”而不是“排序”，优先切到 `$qixin-enterprise-batch-search`。

## References

- 评分模型与硬性否决规则：[references/scoring-framework.md](./references/scoring-framework.md)
- MCP 路由与查询节奏：[references/mcp-route-map.md](./references/mcp-route-map.md)
- 底层 MCP 调用清单：[references/mcp-execution-playbook.md](./references/mcp-execution-playbook.md)
- 测试样例与演示提示词：[references/test-sample.md](./references/test-sample.md)
- 用户可见输出模板：[references/output-template.md](./references/output-template.md)
