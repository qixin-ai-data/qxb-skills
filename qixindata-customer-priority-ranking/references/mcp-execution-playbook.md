# 底层 MCP 调用清单

这份清单只服务于内部执行，不要把里面的 `api_ref`、参数名或技术细节直接暴露给用户。

## 1. 本轮先做什么

先批量读取本轮会用到的接口规格，再开始企业循环：

- 全量初排：`cn_company_registration_face`、`cn_company_concept_labels`、`cn_company_scale`、`cn_company_entity_nature`、`cn_company_contact_info`、`cn_company_composite_risk`
- 条件补充：`cn_company_above_scale`、`cn_company_sme`、`cn_company_main_business`、`cn_company_bidding_list`、`cn_company_commercial_clues`
- 头部深挖：`cn_customer_due_diligence`、`cn_cooperation_risk_scan`

如果用户只要预排序，不要提前读取聚合尽调和聚合风险接口。

## 2. 主体确认顺序

每家企业都先走这一层：

1. `qxb_op_enterprise_resolve`
2. 确认返回主体是中国企业且名称可用
3. 记录规范企业名称与统一社会信用代码
4. 去重后再进画像查询

主体冲突、重名难以确认、明显是分支机构且用户未指定分支客群时，先标为 `待人工确认`。

## 3. 参数名速查

这些接口优先传 `keyword`：

- `cn_company_registration_face`
- `cn_company_entity_nature`
- `cn_company_contact_info`
- `cn_company_composite_risk`
- `cn_company_above_scale`
- `cn_company_sme`
- `cn_company_commercial_clues`
- `cn_customer_due_diligence`
- `cn_cooperation_risk_scan`

这些接口优先传 `name`：

- `cn_company_concept_labels`
- `cn_company_scale`
- `cn_company_main_business`
- `cn_company_bidding_list`

分页型接口默认先补 `skip=0`，确认需要翻页再继续。

## 4. 全量初排最小调用集

默认用这六个接口就足以形成第一版排序底表：

- 工商照面：确认主体、状态、注册资本、成立时间
- 概念标签：识别高新、专精特新、规上、上市、外贸等
- 企业规模：识别大型、中型、小型、微型
- 主体性质：识别央企、国企、民营、事业单位、个体
- 联系方式：识别电话、邮箱、地址等可触达性
- 综合风险分：形成风险扣分基础

只有当行业适配度、规上属性或商机线索不够清晰时，才追加主营业务、规上企业、小微企业、招投标或商业线索。

## 5. 头部样本深挖规则

只对以下样本追加聚合接口：

- 预排序进入 `A` 类的企业
- 分数紧贴白名单边界的高分 `B` 类
- 用户点名要求核实的企业

推荐节奏：

1. 先查 `cn_customer_due_diligence`
2. 看 preview 或摘要是否出现集团、资质、域名、融资等增强证据
3. 再查 `cn_cooperation_risk_scan`
4. 若结果较大，用 `qxb_op_result_query` 抽取特定块

如果聚合风险显示明显高风险，不要因为前面的轻量得分高就继续保留在正式白名单。

## 6. 结果写回内部底表

每查完一家企业，至少更新这些内部字段：

- `status`
- `entity_nature`
- `scale`
- `labels`
- `contact_available`
- `fit_score`
- `value_score`
- `trigger_score`
- `reachability_score`
- `risk_penalty`
- `total_score`
- `priority_class`
- `whitelist_flag`
- `evidence`
- `notes`

先维护内部底表，再统一做排序和用户可见输出，不要边查边改最终结论。
