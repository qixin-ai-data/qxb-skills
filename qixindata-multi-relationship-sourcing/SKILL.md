---
name: qixindata-multi-relationship-sourcing
description: 基于标杆企业、产品或服务线索、目标国家或地区，在当前国内版启信 MCP 中循环调用关系寻源，实现多次批量输出（10-20家）。支持中文自然语言入口和结构化输入，集成单体寻源与编排去重能力，直接输出短名单和长名单。
---

# 启信多次关系寻源

## 概述

本 skill 将单体关系寻源与长名单编排能力合二为一，既能响应用户的单次寻源请求，也能通过循环调用实现多次寻源，输出10-20家的短名单和长名单。

支持两种入口：

- 用户直接用中文自然语言描述寻源需求
- 页面或其他系统传入结构化任务对象

## 输入约定

优先接收已整理好的查询条件。最少应包含：

- 标杆企业名称
- 产品、服务或品类线索
- 目标国家或地区

可选附带：

- 当前批次信息
- 排除名单
- 用户补充候选线索
- 采购场景或角色约束

## 当前接口边界

- 当前 QXBMCP 已切换为国内模式，优先面向中国大陆企业；香港主体只能走独立的 `hk_company_info`
- 不要再调用 `mcp__qixinMCP__qxb_op_enterprise_identify_ai`，该入口当前已下线
- 企业类接口必须使用 `qxb_data_catalog_get` 的 `route_guide` 中原样出现的 `api_ref` 和真实 `api_id`
- 大多数企业类接口优先传企业 `name` 或 `keyword`，不要沿用旧版以 `eid` 为主的调用习惯
- 如果主体超出当前国内版覆盖或候选没有有效联系方式，则明确返回未命中

## 自然语言入口

当用户直接说"帮我找某公司在某地区的某类供应商名单"这类需求时，先读取 [自然语言任务转译](./references/自然语言任务转译.md)，把原始请求转成标准 JSON，再继续后续流程。

执行规则：

1. 如果 `benchmark_enterprise`、`product_query`、`target_regions` 三项齐全，直接进入寻源流程。
2. 如果存在缺失字段，只追问缺失项，一次只问最少信息。
3. 不要臆造标杆企业、产品词或目标地区。

## 标准化任务输入

将输入整理为标准任务维度：

- benchmark：标杆企业
- product：原始产品词和归一化产品词
- regions：目标地区列表
- constraints：筛选条件
- target_counts：长名单目标数量（默认10-20家）
- exclusions：已有排除名单

默认值：

- 长名单目标：`longlist_min=10`、`longlist_ideal=20`
- 短名单目标：`shortlist_target=5`
- 若用户没有提供排除名单，初始化为空数组

## 循环寻源流程

### 第一步：先判断任务是否在当前接口覆盖范围内

- 判断标杆企业是否能被当前国内版启信 MCP 解析为中国大陆企业
- 判断用户要求核验的候选主体是否属于中国大陆或香港

处理规则：

- 标杆企业可解析为国内主体时，优先走"标杆扩池 + 候选核验"
- 用户已经给出明确候选企业名称时，可直接进入候选核验
- 只有香港主体时，可使用 `hk_company_info` 做基础核验
- 需要直接核验海外非香港主体时，明确返回能力边界

### 第二步：解析标杆主体与约束

使用以下主体解析工具：

1. `mcp__qixinMCP__qxb_op_enterprise_resolve`

解析时默认记录：

- 候选序号
- `eid`
- 标准企业名称 `ename`
- `country`
- `country_code`
- `identifier_code`

### 第三步：先确认将要用到的接口规格

每次在新任务中首次调用某个 `api_ref` 前，先使用 `mcp__qixinMCP__qxb_op_api_spec_get` 读取说明，确认：

- 是否应传 `name` 还是 `keyword`
- 默认分页参数和可选参数
- 关键返回字段名

### 第四步：循环扩候选并核验

#### 扩候选来源（按以下顺序）：

1. `cn_company_suppliers`：获取供应商名单
2. `cn_company_supply_chain`：获取甲方、乙方、合作方线索
3. `cn_customer_due_diligence`：补充集团、行业、域名、分支等结构化线索

#### 核验接口（按以下顺序）：

1. `cn_company_registration_face`：看企业名称、状态、成立时间、经营范围、地址
2. `cn_company_industry_nec`：看国民经济行业分类
3. `cn_company_contact_info`：看电话、邮箱、地址
4. `cn_company_triple_codes`：补统一社会信用代码、组织机构代码、注册号
5. `cn_customer_due_diligence`：补集团、标签、网站域名、员工、分支等聚合信息

对香港候选，只能使用：

1. `hk_company_info`

### 第五步：校验联系方式

当前国内版接口下，按以下顺序判断是否存在有效联系方式：

1. `cn_company_contact_info.data.telephone`
2. `cn_company_contact_info.data.email`
3. `cn_customer_due_diligence` 中 `contract_info.websites_list` 或 `domain_list`

注意：

- `address` 不是有效联系方式
- `employees_list` 里的高管姓名只能作为辅助信息
- 当前接口没有稳定的"高管直接联系方式"字段时，保留空值

### 第六步：按固定优先级做最终判断

优先级从高到低为：

1. 企业状态是否正常
2. 产品或业务匹配度
3. 国家或地区匹配度
4. 与标杆企业的关系或相似性信号

状态判断使用 [状态与筛选规则](./references/状态与筛选规则.md) 中的映射。

## 多次寻源与去重

### 排除与去重

使用两层去重：

#### 运行时去重

每次调用单体寻源时，附带全局排除名单。

排除名单至少包含：

- `exclude_eids`
- `exclude_names`
- `exclude_domains`

#### 结果归并去重

在写入长名单前，按以下优先级去重：

1. `eid`
2. 标准企业名称
3. 标准企业名称加国家或地区
4. 官网域名

如果 `eid` 相同，直接视为同一企业。

### 批次停止规则

- 连续 3 次未命中，暂停该批次
- 连续 2 次命中重复企业，降低优先级
- 累计 5 次调用后，若新增企业少于 2 家，则结束该批次
- 若全局已达到 `longlist_ideal`，停止扩池

## 排序与分层

### 评分维度

- `product_fit`：产品或业务匹配
- `region_fit`：地区匹配
- `status_and_maturity`：状态与成熟度
- `contact_quality`：联系方式质量
- `activity_signal`：公开活动信号
- `risk_stability`：风险与稳定性

### 默认权重

- 产品或业务匹配：`35`
- 地区匹配：`20`
- 状态与成熟度：`20`
- 联系方式质量：`15`
- 公开活动信号：`5`
- 风险与稳定性：`5`

### 匹配层级

将候选企业分为：

- `direct`：直接匹配
- `adjacent`：邻近匹配
- `exploratory`：探索匹配

### 分层结果

按最终分数分层：

- `A`：高优先级
- `B`：重点关注
- `C`：补池候选

## 结果输出

### 长名单要求

- 默认目标不少于 10 家
- 理想目标为 20 家
- 若未达最小数量，明确说明原因

### 短名单要求

- 默认从长名单中压缩出 5 家
- 短名单必须保留可解释的推荐理由

### 输出结构

至少输出：

1. 长名单（10-20家）
2. 短名单（5家）
3. 搜索边界说明
4. 数据缺口说明

### 搜索边界要求

始终说明当前结果是否为：

- 有界候选池长名单
- 基于补充线索的结构化扩池结果
- 尚未覆盖全市场的阶段性结果

## 输出字段模板

每次寻源命中后，输出稳定结构：

```json
{
  "企业名称": "",
  "企业状态": "",
  "国家/地区": "",
  "所属地区": "",
  "匹配理由": "",
  "官网": "",
  "电话": "",
  "邮箱": "",
  "匹配层级": "",
  "排序分数": 0
}
```

字段说明：

- 企业名称：优先使用 `cn_company_registration_face` 的 `format_name` 或 `name`
- 企业状态：优先使用 `cn_company_registration_face` 的 `new_status`
- 国家/地区：中国大陆主体填"中国"，香港主体填"中国香港"
- 所属地区：优先取 `cn_company_contact_info.address`
- 匹配理由：只写最终入选依据，不写长篇分析
- 官网：从 `cn_customer_due_diligence` 的 `domain_list` 或 `contract_info.websites_list` 提取
- 电话：优先取 `cn_company_contact_info.telephone`
- 邮箱：优先取 `cn_company_contact_info.email`
- 匹配层级：`direct`、`adjacent`、`exploratory`
- 排序分数：0-100

## 失败处理

出现以下情况时，输出已收集结果并说明阻塞点：

- 下层能力不可用
- 同一批次持续低命中且无替代批次
- 接口无法返回有效联系方式

此时应输出：

1. 已收集候选数
2. 主要阻塞原因
3. 下一步建议

## 工具使用提示

- 先用 `qxb_op_enterprise_resolve` 确认主体，再调用企业类接口
- 调用 `qxb_op_api_call` 时，`api_ref` 和 `api_id` 必须与 `route_guide` 保持一致
- 在调用具体企业类接口前，优先确认需要传 `name` 还是 `keyword`
- 仅保留能被启信 MCP 返回结果支撑的判断，不凭空补全联系方式或关系结论
- 使用 `cn_customer_due_diligence` 时，先看 preview；需要细查时再用 `mcp__qixinMCP__qxb_op_result_query`
- `cn_company_suppliers` 和 `cn_company_supply_chain` 更适合做扩候选，不适合直接拿来当最终入选证据

## 输出要求

- 保持中文输出
- 保持字段名稳定，方便后续网页多次调用和去重
- 匹配理由只写支撑最终入选的核心依据，不展开候选过程
- 不额外附加长篇分析
- 若启信 MCP 当前不可用，明确说明是"接口未成功返回，无法完成实测"，不要伪造接口结果
