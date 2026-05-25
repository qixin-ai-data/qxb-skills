# Input Schema

## Minimum Required Fields

至少具备以下任一字段：

- `key_account_name`
- `credit_no`

只要能确认重点客户主体，就可以做基础商机扫描。

## Recommended Fields

如果用户能提供以下字段，机会判断会更准：

- `current_products`
- `focus_products`
- `allow_affiliates` 或 `expand_scope`
- `owner`
- `branch`
- `notes`

## Canonical Field Mapping

| 标准字段 | 常见别名 | 是否必需 | 用途 |
| --- | --- | --- | --- |
| `key_account_name` | 重点客户名称、客户名称、企业名称、公司名称、户名 | 是 | 重点客户主体解析 |
| `credit_no` | 统一社会信用代码、信用代码、统信码 | 否 | 强标识去重与主体核验 |
| `anchor_id` | 客户编号、重点客户编号、CRM客户号、内部客户ID | 否 | 回写或导出时保留主键 |
| `owner` | 客户经理、RM、归属人、负责人 | 否 | 判断后续跟进归属 |
| `branch` | 机构、分行、支行、团队、部门 | 否 | 做内部归属或筛选 |
| `current_products` | 已合作产品、当前产品、已覆盖产品、已开产品 | 否 | 判断开户、授信、跨境和交叉销售缺口 |
| `focus_products` | 目标产品、关注产品、想做的产品、商机方向 | 否 | 缩小本轮扫描范围 |
| `allow_affiliates` | 是否展开子公司、是否包含关联主体 | 否 | 控制是否向外展开关系主体 |
| `expand_scope` | 展开范围、关联主体范围 | 否 | 约束扩展到子公司、集团成员或同实控企业 |
| `priority_tag` | 重点标签、战略客群、白名单标签 | 否 | 内部优先级加权 |
| `notes` | 备注、客户摘要、机会说明 | 否 | 提取明确业务线索，不挖敏感内容 |

## Normalization Rules

- 同一字段出现多个列名时，优先保留信息更完整的一列，其他列并入备注，不要无提示覆盖。
- `current_products` 和 `focus_products` 支持逗号、中文顿号、斜杠、分号分隔；拆分后统一映射到标准产品词表。
- 标准产品词表优先收敛到：`开户`、`结算`、`授信`、`跨境`、`票据`、`保理`、`供应链金融`、`代发`。
- `allow_affiliates` 没有明确值时，默认按 `yes` 理解；如果用户明确只看本体，再切到 `self-only`。
- `expand_scope` 缺失时，默认按 `self-and-affiliates` 处理，即“重点客户本体 + 直接参股控股企业 + 集团成员”。
- 当 `key_account_name` 与 `credit_no` 指向不同主体时，直接打 `待人工确认`，不要擅自选一边。
- 备注列只提取明确的业务线索，例如“只做了开户，想看跨境和授信”“希望看子公司机会”；不要把长篇 CRM 私密备注原样带入输出。

## Missing-Field Behavior

- 只有 `key_account_name` 没有其他内部字段：允许做外部商机扫描，但所有“产品缺口”都降级成 `潜在机会`。
- 没有 `current_products`：不输出“已确认未覆盖某产品”，只输出“潜在开户/潜在授信/潜在跨境/潜在交叉机会”。
- 没有 `focus_products`：默认同时扫描跨境、开户、授信和业务交叉。
- 没有 `allow_affiliates` 或 `expand_scope`：默认展开一层关联主体。
- 没有 `owner` 或 `branch`：不影响识别机会，但在下一步动作里不要写死责任人。

## Deduplication Rules

1. 优先按 `credit_no` 去重。
2. 没有 `credit_no` 时，按规范化 `key_account_name` 去重。
3. 去重时保留内部字段更完整的那条记录。
4. 如果两条记录内部字段互补，合并字段并在 `notes` 里标记为合并来源。
