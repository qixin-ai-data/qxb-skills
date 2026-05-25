# Domestic Batch Search Capabilities

## Scope

本参考文档只描述当前启信 MCP 在“国内企业批量检索与筛选”场景下已经确认可用的接口组合，以及哪些条件可以直接下推、哪些条件只能做二次筛选。

## Batch Entry Matrix

### 周边企业

- 主接口：
  - `cn_nearby_company_search`
  - `cn_nearby_company_count`
  - `cn_nearby_company_detail`
- 适用入口：
  - 用户提供锚点企业
  - 用户提供坐标和半径
  - 用户明确要找“某企业周边”或“某地点周边”的企业
- 可直接筛选：
  - 半径
  - 行业代码
  - 注册资本区间
  - 经营状态
- 典型输出：
  - 企业名称
  - 距离
  - 行业
  - 法定代表人
  - 部分场景下可直接拿到企业 id
- 注意事项：
  - `cn_nearby_company_search` 依赖锚点企业解析
  - `cn_nearby_company_detail` 更适合做坐标型精确过滤

### 园区企业

- 主接口：
  - `cn_industrial_park_companies`
- 适用入口：
  - 用户给出明确园区名称
- 可直接筛选：
  - 状态
  - 成立时间范围
- 典型输出：
  - 企业名称
  - 统一社会信用代码
  - 注册资本
- 注意事项：
  - 不返回完整 EID，最终名单建议再走 `cn_company_registration_face`

### 开发区企业

- 主接口：
  - `cn_development_zone_companies`
- 适用入口：
  - 用户给出明确开发区名称
- 可直接筛选：
  - 无明确业务筛选参数，主要靠分页
- 典型输出：
  - 企业名称
  - 统一社会信用代码
  - 法定代表人
  - 注册资本
  - 成立日期
  - 经营范围
- 注意事项：
  - 更适合作为候选池入口，再叠加二次筛选

## Secondary Screening Matrix

### 必补基础信息

- `cn_company_registration_face`
- 作用：
  - 补齐 EID
  - 拿标准企业名称
  - 统一状态、地址、经营范围、注册资本字段
- 说明：
  - 这是最终名单标准化的首选接口

### 标签类筛选

- `cn_company_concept_labels`
- 适用条件示例：
  - 高新技术企业
  - 专精特新
  - 上市相关
  - 互联网
  - 外贸
  - 金融科技
- 说明：
  - 标签结果适合做“命中型”筛选
  - 标签缺失不应直接等价于“不符合”

### 规模类筛选

- `cn_company_scale`
- 适用条件示例：
  - 大型 / 中型 / 小型 / 微型
- 说明：
  - 有些企业会返回空结果，不能把空结果当作否定证据

### 小微 / 规上

- `cn_company_sme`
- `cn_company_above_scale`
- 适用条件示例：
  - 小微企业
  - 规上企业
- 说明：
  - 更适合对已经缩小后的候选集做逐家核验

### 主体性质 / 资本背景

- `cn_company_entity_nature`
- `cn_company_capital_background`
- 适用条件示例：
  - 民营企业
  - 央企 / 国企
  - 事业单位
  - 个体工商户
  - 国资背景 / 民资背景

### 行业标准化

- `cn_company_industry_nec`
- 作用：
  - 把企业行业统一到国民经济行业分类
- 说明：
  - 如果批量入口没有直接行业筛选，或用户给的是宽泛行业词，可在二次筛选阶段用于标准化比对

## Recommended Execution Pattern

1. 先选批量入口，不要先假设存在全国统一企业搜索。
2. 拉候选列表，默认控制在前 100 条。
3. 对去重后的候选企业，优先补 `cn_company_registration_face`。
4. 只对用户明确要求的维度做二次 enrich。
5. 候选集过大时，不做全量逐家深筛，先返回概览并建议缩小范围。

## Conditions That Need User Narrowing

以下请求通常需要用户进一步缩小条件，否则当前 MCP 无法高质量执行：

- 只给“省份 + 行业”就要全国企业清单
- 只给“高新技术企业”就要某省全量名单
- 只给“中型制造企业”就要批量返回 EID
- 只给“AI 芯片企业”但没有园区、开发区、锚点企业或候选名单

此时优先要求用户补充：

- 园区名
- 开发区名
- 锚点企业
- 经纬度与半径
- 或者一个较小的候选名单范围

## Output Recommendations

推荐最终名单至少包含：

- `name`
- `eid`
- `credit_no`
- `oper_name`
- `regist_capi`
- `start_date`
- `status`
- `address`
- `matched_conditions`

若某些筛选条件无法完全核验，额外加一列：

- `verification_note`

用于标记：

- 已命中
- 未命中
- 未核验
