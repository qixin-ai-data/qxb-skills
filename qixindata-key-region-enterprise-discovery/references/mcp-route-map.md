# 区域发现入口与 MCP 路由

## 固定入口选择

按下列顺序选入口，不要混用：

1. `开发区语义`：`开发区 / 经开区 / 高新区 / 产业开发区`
2. `园区语义`：`园区 / 产业园 / 科技园 / 保税区`
3. `周边语义`：`周边 / 附近 / X 公里 / 某企业周边`
4. `候选名单语义`：用户已经给出企业名单
5. `城市或产业带语义`：只有在同时给出可执行锚点时才继续

## 入口路由

### 1. 开发区发现

先用：

- `cn_development_zone_info`
- `cn_development_zone_companies`

用途：

- 确认开发区基本信息、主导产业、级别和区位
- 获取开发区企业列表

默认参数提醒：

- `zone_name` 必填
- `skip` 默认从 `0` 开始

### 2. 园区发现

先用：

- `cn_industrial_park_info`
- `cn_industrial_park_companies`

用途：

- 确认园区名称、地区、面积、产业方向和企业数
- 获取园区内企业列表

默认参数提醒：

- `park_name` 必填
- `status_code`、`start_date` 只有在用户明确要求时再加
- `skip` 默认从 `0` 开始

### 3. 周边发现

有锚点企业时优先用：

- `qxb_op_enterprise_resolve`
- `cn_nearby_company_search`

有明确坐标时用：

- `cn_nearby_company_count`
- `cn_nearby_company_detail`

用途：

- 围绕龙头企业、工厂、总部、地标或坐标做半径搜索
- 适合“某企业周边 3 公里内值得关注的企业”

默认参数提醒：

- `cn_nearby_company_search` 需要 `keyword` 和 `distance`
- `cn_nearby_company_count/detail` 需要先看规格再确认经纬度与半径参数

### 4. 候选名单发现

用户已经给出企业名单时，不再强行走区域入口，直接进入候选池补全与排序：

- `qxb_op_enterprise_resolve`
- `cn_company_registration_face`
- 其余补全接口按主题追加

### 5. 城市或产业带发现

当前 MCP 没有“按城市或产业带直接批量列出全部企业”的通用入口。遇到以下请求时不要伪造流程：

- “深圳全市的机器人企业都拉出来”
- “长三角新能源产业带企业一键扫全”

只在用户同时提供这些锚点之一时继续：

- 园区名
- 开发区名
- 锚点企业
- 经纬度或地理锚点
- 已有候选名单

如果用户只给城市或产业带，明确说明限制，并请其补充 1-3 个可执行锚点。

## 补全路由

### 全量轻量补全

优先对所有候选企业补这些信号：

- `cn_company_registration_face`
- `cn_company_concept_labels`
- `cn_company_scale`
- `cn_company_entity_nature`
- `cn_company_composite_risk`

### 条件补充

按需追加：

- `cn_company_main_business`
- `cn_company_industry_nec`
- `cn_company_above_scale`
- `cn_company_sme`

### 头部与边界样本增强

只对头部和边界样本补这些信号：

- `cn_company_contact_info`
- `cn_company_justice_risk`
- `cn_company_tech_innovation_score`
- `cn_company_tech_innovation_composite_score`

银行或商机语义下再加：

- `cn_company_commercial_clues`

## 查询节奏

遵守这个顺序：

1. 选定唯一入口
2. 拿候选池并去重
3. 跑全量轻量补全
4. 做第一轮区域发现预排
5. 对头部和边界样本做增强验证
6. 输出 A 类清单、候补名单和复核项

候选规模建议：

- `<= 20`：可对全量候选做大部分轻量补全，并对前 10 家增强验证
- `21-100`：全量轻量补全，前 10-20 家增强验证
- `> 100`：先输出预排和收窄建议，不默认全量跑增强接口

## 去重与一致性

按这个顺序去重和校验：

1. 统一社会信用代码
2. 规范化企业全称
3. 区域入口与当前工商地址一致性
4. 主体层级是否为独立企业主体

如果列表命中但工商地址已明显迁出目标区域，且用户要的是“当前区域重点企业”，默认不进入正式 A 类名单。
