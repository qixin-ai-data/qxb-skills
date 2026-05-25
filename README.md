# Agent Skills - 企业数据智能体技能集

由 [启信数据](https://ai.qixin.com/) 研发，基于启信数据 MCP（Model Context Protocol）API 构建的企业数据领域 AI 智能体技能集合。覆盖企业尽职调查、风险筛查、信用分析、客户评级、关系图谱、舆情扫描等核心场景，为银行、券商、律所、采购等机构提供可复用的智能化工作流。

## 技能总览（18 个）

### 企业尽调与报告

| 技能 | 中文名 | 说明 |
|------|--------|------|
| [qixindata-counterparty-identity-check](./qixindata-counterparty-identity-check) | 企业主体核验 | 快速核验目标企业主体身份，避免信息混淆找错公司 |
| [qixindata-enterprise-panorama-diligence](./qixindata-enterprise-panorama-diligence) | 企业全景尽调 | 从工商、股权、管理层、经营状态和风险等维度快速形成企业全景画像 |
| [qixindata-credit-due-diligence-report](./qixindata-credit-due-diligence-report) | 授信尽调底稿 | 整合企业基础信息、经营情况与主要风险，形成授信评审的尽调底稿 |
| [qixindata-pre-admission-check](./qixindata-pre-admission-check) | KYB 准入核验 | 业务准入前，快速判断企业是否具备进入下一步流程的基础条件 |
| [qixindata-enterprise-relationship-report](./qixindata-enterprise-relationship-report) | 企业关系排查 | 对两家或多家企业开展股权、管理层、控制链和疑似关联关系排查 |
| [qixindata-related-enterprise-risk-report](./qixindata-related-enterprise-risk-report) | 供应链风险排查 | 评估目标企业的关联企业、同实控圈、关键人物外部网络等风险 |

### 客户拓展与评级

| 技能 | 中文名 | 说明 |
|------|--------|------|
| [qixindata-customer-priority-ranking](./qixindata-customer-priority-ranking) | 客户优先级排序 | 从一批潜在客户中识别更值得优先拜访和跟进的高价值企业 |
| [qixindata-customer-recommendation](./qixindata-customer-recommendation) | 存量客户深挖推荐 | 从存量客户池中识别更适合追加走访、增额或交叉销售的客户 |
| [qixindata-bank-credit-prospecting](./qixindata-bank-credit-prospecting) | 授信客户拓展 | 针对企业池，自动排名并筛选相应业务机会 |
| [qixindata-candidate-enterprise-compare](./qixindata-candidate-enterprise-compare) | 候选企业快速比选 | 将多家候选企业放在同一视角下比较综合实力、风险与合作适配度 |

### 企业搜索与发现

| 技能 | 中文名 | 说明 |
|------|--------|------|
| [qixindata-enterprise-batch-search](./qixindata-enterprise-batch-search) | 园区企业检索 | 在园区、商圈或指定地理范围结合行业等条件筛选出目标企业名单 |
| [qixindata-key-region-enterprise-discovery](./qixindata-key-region-enterprise-discovery) | 重点区域企业发现 | 在园区、城市或产业带中筛选出更值得关注的重点企业 |
| [qixindata-multi-relationship-sourcing](./qixindata-multi-relationship-sourcing) | 关系寻源 | 通过标杆企业与产品，找到更多类似企业 |

### 风险筛查与监控

| 技能 | 中文名 | 说明 |
|------|--------|------|
| [qixindata-cooperation-risk-quick-check](./qixindata-cooperation-risk-quick-check) | 公司风险速查 | 合作前期，速查风险，轻便快捷 |
| [qixindata-bank-customer-admission-quick-check](./qixindata-bank-customer-admission-quick-check) | 客户准入风险筛查 | 业务前期，把控准入关口，提供下一步建议 |
| [qixindata-judicial-operational-risk-check](./qixindata-judicial-operational-risk-check) | 司法与经营风险体检 | 全范围深度检查，完整的司法与经营风险报告 |
| [qixindata-public-opinion-negative-scan](./qixindata-public-opinion-negative-scan) | 负面舆情扫描 | 联网 + 启信数据库，网罗企业负面舆情 |
| [qixindata-risk-monitor-broadcast](./qixindata-risk-monitor-broadcast) | 动态风险监控 | 基线报告 + 每日监控，定时定点推送企业最新消息 |

## 典型用法示例

| 技能 | 示例提示词 |
|------|-----------|
| 企业主体核验 | 合同上写的是"生腾数据"，但对方说自己是"合合信息"，帮我查下这俩到底是不是同一家 |
| KYB 准入核验 | 我们在引入合合信息做供应商，帮我跑一下准入核验，看看基本条件够不够 |
| 企业全景尽调 | 帮我全面查一下合合信息这家公司，工商、股权、经营状况这些都看看 |
| 授信尽调底稿 | 合合信息要来我们这做授信，帮我出一份包含基本面、经营情况和主要风险的底稿报告 |
| 候选企业快速比选 | 我们在选数据供应商，候选的有合合信息、XX数据和XX信息，帮我拉个对比，看看哪家综合实力更强、风险更小 |
| 客户优先级排序 | 下周要跑客户，手上有A、B、C这三家企业，时间有限，帮我看看哪家更值得优先拜访 |
| 重点区域企业发现 | 我要去这个园区，重点关注新能源方向的中大型客户，帮我筛一下建议去哪几家 |
| 存量客户深挖推荐 | 我的存量客户池里有这些企业，帮我看看哪几家值得再跟一轮，重点关注能追加授信或者增额的 |
| 园区企业检索 | 我在市北高新园区这边见完客户，帮我查下附近5公里有没有其他做数据服务或人工智能的公司 |
| 企业关系排查 | 帮我排查一下合合信息和生腾数据之间的关系，看看是不是同一个实控人，有没有交叉持股 |
| 供应链风险排查 | 合合信息的上下游供应链帮我做个风险排查，看看关联企业和核心供应商有没有什么隐患 |
| 关系寻源 | 以合合信息为参照，帮我找20家类似的数据服务企业，行业和规模尽量接近 |
| 公司风险速查 | 帮我对合合信息做个风险速查，不用太详细，主要看看有没有大的风险 |
| 客户准入风险筛查 | 合合信息要走准入流程，帮我做一轮风险筛查，看看能不能放行 |
| 负面舆情扫描 | 帮我扫一下合合信息最近有没有什么负面新闻或者舆情，网上的和数据库里的都查查 |
| 司法与经营风险体检 | 帮我给合合信息做一次全面的司法和经营风险体检，诉讼、处罚、异常经营这些都要查到 |
| 动态风险监控 | 帮我把合合信息加到监控名单里，设个每日监控，9点推消息到飞书，有风险变化第一时间提醒我 |
| 授信客户拓展 | 这里有20家企业的名单，帮我按授信潜力排个序，筛出最值得跟进的几家 |

## 技能结构

每个技能遵循统一的目录结构：

```
<skill-name>/
├── SKILL.md              # 技能定义（YAML frontmatter + 完整指令）
├── agents/
│   └── openai.yaml       # Agent 接口配置（显示名称、描述、默认提示词）
├── references/           # 参考文档
│   ├── *.md              # 评分模型、API 映射、规则文档、报告模板等
│   └── *.json            # 数据文件（如监控清单）
├── scripts/              # 工具脚本（可选）
│   └── export-report-pdf.js   # Markdown → PDF 导出
└── assets/               # 品牌资源（可选）
    └── logo.png
```

### 核心文件说明

- **SKILL.md** — 技能的核心定义文件，包含技能名称、描述、工作流程、安全边界、输出规范等完整指令
- **agents/openai.yaml** — Agent 适配层配置，定义在 AI 平台中的展示方式与默认交互提示词
- **references/** — 辅助参考文档，提供评分框架、API 路由映射、判断规则、报告模板、分析契约等支撑材料

## MCP 接口约定

所有技能通过统一的 MCP 工具函数与启信数据平台交互：

| 函数 | 用途 |
|------|------|
| `qxb_op_enterprise_resolve` | 企业身份解析 — 将企业名称/统一社会信用代码解析为唯一实体 |
| `qxb_op_api_spec_get` | API 参数规格查询 — 调用前检查接口参数要求 |
| `qxb_op_api_call` | 执行数据调用 — 获取企业工商、司法、经营、资质等数据 |
| `qxb_op_result_query` | 结果下钻查询 — 查询聚合接口的分页明细 |

## 设计原则

- **安全第一** — 全部操作只读，不监控、不订阅、不回写；对用户屏蔽 API 内部细节；区分"未查到"与"确认不存在"
- **结论保守** — 证据不足时倾向保守判断，避免过度推断
- **可复现性** — 固定分析对象、标准化评分公式、句子库、固定输出模板，减少不同运行间的结果差异
- **分层深度** — 从轻量速查（2 次 API 调用）到深度报告（数十次 API 调用 + 多阶段工作流），满足不同场景需求
- **PDF 优先交付** — 报告类技能均支持通过 Headless Chrome 将 Markdown 转换为 PDF 交付

## 适用场景

| 行业/角色 | 推荐技能 |
|-----------|----------|
| 银行对公客户经理 | customer-priority-ranking, bank-credit-prospecting, bank-customer-admission-quick-check |
| 银行风控审批 | credit-due-diligence-report, pre-admission-check |
| 采购合规 | cooperation-risk-quick-check, candidate-enterprise-compare, pre-admission-check |
| 投资尽调 | enterprise-panorama-diligence, enterprise-relationship-report |
| 法务合规 | judicial-operational-risk-check, counterparty-identity-check |
| 舆情监控 | public-opinion-negative-scan, risk-monitor-broadcast |
| 供应链管理 | related-enterprise-risk-report, enterprise-batch-search |
| 客户经营 | customer-recommendation |
| 区域拓客 | key-region-enterprise-discovery, enterprise-batch-search, multi-relationship-sourcing |

## 依赖与要求

- MCP 运行环境（需配置启信数据 MCP 服务端点）
- 报告类技能的 PDF 导出需 Node.js 环境（`export-report-pdf.js` 使用 Puppeteer/Headless Chrome）

## License

[Apache License 2.0](./LICENSE)
