# MCP Route Map

## Fixed Call Order

1. 先用 `qxb_op_enterprise_resolve` 确认重点客户主体。
2. 第一次调用某个接口前，用 `qxb_op_api_spec_get` 读取参数说明。
3. 再用 `qxb_op_api_call` 查询。
4. 聚合型大结果优先看 preview，需要细查时再用 `qxb_op_result_query`。

不要跳过前两步，也不要把接口猜测写进用户可见内容。

## Anchor And Affiliate Expansion Routes

| 目的 | api_ref | api_id | 常用入参 | 默认用途 |
| --- | --- | --- | --- | --- |
| 工商照面 | `cn_company_registration_face` | `1.41` | `keyword=<企业全名或信用代码>` | 统一重点客户主体 |
| 参股控股企业 | `cn_company_invested_enterprises` | `77.76` | `keyword=<企业全名或信用代码>, skip=0` | 发现直接子公司或控股实体 |
| 集团成员 | `cn_company_group_members` | `31.29` | `name=<企业全名>, skip=0` | 发现集团内其他可覆盖主体 |
| 同实控企业 | `cn_company_controlled_companies` | `33.13` | `name=<企业全名>` | 集团关系不全时补充同实控主体 |

## Core Signal Routes

| 目的 | api_ref | api_id | 常用入参 | 默认用途 |
| --- | --- | --- | --- | --- |
| 联系方式 | `cn_company_contact_info` | `1.51` | `keyword=<企业全名或信用代码>` | 判断是否便于触达 |
| 主营业务 | `cn_company_main_business` | `1.25` | `name=<企业全名>, skip=0` | 判断跨境或产品适配方向 |
| 营销商机线索 | `cn_company_commercial_clues` | `23.48` | `keyword=<企业全名或信用代码>, skip=0` | 识别开户、授信、存款、拓客等信号 |
| 进出口企业 | `cn_company_import_export` | `53.1` | `name=<企业全名>` | 识别跨境结算和贸易融资机会 |
| 供应链上下游 | `cn_company_supply_chain` | `79.41` | `name=<企业全名>, skip=0` | 识别上下游关系与供应链金融机会 |
| 企业客户 | `cn_company_customers` | `77.2` | `name=<企业全名>, skip=0` | 识别下游客户生态和交叉机会 |
| 企业供应商 | `cn_company_suppliers` | `77.1` | `name=<企业全名>, skip=0` | 识别上游采购和交叉机会 |
| 综合风险分 | `cn_company_composite_risk` | `72.51` | `keyword=<企业全名或信用代码>` | 对所有机会主体做轻量风险约束 |

## Validation Routes For Top Opportunities

| 目的 | api_ref | api_id | 常用入参 | 适用时机 |
| --- | --- | --- | --- | --- |
| 客户信息尽调 | `cn_customer_due_diligence` | `47.51` | `keyword=<企业全名或信用代码>, is_history=0` | 给 A 类机会补集团、资质、融资等证据 |
| 合作风险排查 | `cn_cooperation_risk_scan` | `55.29` | `keyword=<企业全名或信用代码>, is_history=0` | 给 A 类机会做风险兜底 |
| 招投标列表 | `cn_company_bidding_list` | `21.4` | `name=<企业全名>, skip=0` | 需要增强项目活跃度证据时补充 |

## Opportunity Mapping Hints

- `cn_company_commercial_clues` 出现 `开户` 或 `E003` 语义时，优先映射到 `开户机会`。
- `cn_company_commercial_clues` 出现 `授信`、`融资`、`保理`、`票据` 等语义时，优先映射到 `授信机会`。
- `cn_company_import_export` 命中时，优先映射到 `跨境机会`。
- `cn_company_supply_chain`、`cn_company_customers`、`cn_company_suppliers` 更适合支撑 `业务交叉机会` 或 `供应链金融` 机会。
- 缺少当前产品覆盖时，上述映射只能说明“存在机会信号”，不能自动得出“当前未覆盖”结论。

## Query Patterns For Aggregated Results

### `cn_customer_due_diligence`

- 基础档案：`$.data.ent_info`
- 集团信息：`$.data.group_info`
- 上市信息：`$.data.listed_info`
- 网站域名：`$.data.domain_list[0:10]`
- 融资历史：`$.data.financing_list[0:10]`

### `cn_cooperation_risk_scan`

- 企业基础信息：`$.data.ent_info`
- 裁判文书：`$.data.judgement_list[0:10]`
- 被执行人：`$.data.enforcement_list[0:10]`
- 限制高消费：`$.data.restricted_consumer_list[0:10]`
- 行政处罚：`$.data.administrative_punishment_list[0:10]`
- 欠税信息：`$.data.overduetaxs_list[0:10]`

## Usage Notes

- 默认先扫重点客户本体，再展开一层关联主体，不做多层递归。
- 如果单个重点客户的关联主体过多，先保留状态正常、关系清晰、机会信号更强的前 20 个实体。
- `cn_company_commercial_clues` 是 `bank-rm` 场景的核心接口，但不要对超大名单无差别全量翻页。
- 聚合型接口结果过大时，不要把整段 JSON 暴露给用户；只提炼证据和结论。
- 外部接口没有返回，不等于没有该特征；统一写成 `未核验`。
