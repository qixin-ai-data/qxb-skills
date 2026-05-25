# MCP 路由与查询节奏

## 固定原则

- 先确认主体，再补画像，再打分，再深挖头部样本。
- 第一次调用某个接口前先做 `qxb_op_api_spec_get`。
- 默认只用中国企业接口，不走海外主体流程。
- 除非用户明确需要，不要全量跑聚合报告类接口。
- 底层路由能批量取规格时，优先一次性把本轮会用到的规格读完，再开始企业循环。

## 全量轻量路由

对所有候选企业优先使用这些接口：

- `qxb_op_enterprise_resolve`
- `cn_company_registration_face`
- `cn_company_concept_labels`
- `cn_company_scale`
- `cn_company_entity_nature`
- `cn_company_contact_info`
- `cn_company_composite_risk`

这些接口足以完成大多数初排。

参数名提醒：

- `registration_face` / `entity_nature` / `contact_info` / `composite_risk` 优先传 `keyword`
- `concept_labels` / `scale` 优先传 `name`

## 条件追加路由

按需追加：

- `cn_company_above_scale`：确认规上属性
- `cn_company_sme`：确认小微属性
- `cn_company_main_business`：补行业与业务适配度
- `cn_company_bidding_list`：补近期项目机会
- `cn_company_commercial_clues`：银行客户经理模式下补商机线索

参数名提醒：

- `above_scale` / `sme` / `commercial_clues` 优先传 `keyword`
- `main_business` / `bidding_list` 优先传 `name`

## 深挖路由

只对前排或边界样本追加：

- `cn_customer_due_diligence`
- `cn_cooperation_risk_scan`

如需从大结果里精确取字段，配合 `qxb_op_result_query` 使用，不要整段展开。

聚合接口默认建议：

- 先看 preview、section summary 或高亮摘要
- 只在需要证明集团、资质、域名、融资或强风险时再向下钻取
- 如只关心少数主题，优先用 `dimension` 缩小结果

## 查询节奏建议

- 候选企业 `<= 20`：全量轻量路由，前 10 家深挖
- 候选企业 `21-100`：全量轻量路由，前 10-15 家深挖
- 候选企业 `> 100`：先做预排序，再建议缩小范围

推荐执行顺序：

1. 主体确认与去重
2. 全量轻量画像
3. 初排与分层
4. 头部深挖
5. 回调总分与白名单

## 没有客户池时怎么做

- 如果任务重点是“先找企业，再做优先级排序”，先用 `$qixin-enterprise-batch-search` 获取客户池。
- 如果用户只给出园区、开发区、周边、行业等范围条件，先完成客户池生成，再返回本 skill 做评分和白名单建议。

## 结果解释规则

- 用业务语言解释排序原因，不暴露底层接口名和技术细节。
- 证据不够时写“待人工确认”或“当前可核信息不足”，不要伪造确定性。
- 同时解释“为什么值得优先拜访”和“为什么没有进正式白名单”，不要只给一个模糊结论。
