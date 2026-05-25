# MCP Playbook

在需要底层接口路由、参数差异、聚合接口钻取或授信底稿推荐组合时再读取本文件。

## Always-On Rules

- 从企业名称、简称、曾用名、统一社会信用代码或注册号出发时，先做 `qxb_op_enterprise_resolve`。
- 第一次调用某个新接口前，先做 `qxb_op_api_spec_get`。
- 国内企业查询优先传正式企业全称、统一社会信用代码或注册号，不要猜 `eid`。
- 先做细粒度核验，只有信息冲突、维度很多或用户明确要求时才升到聚合接口。
- 聚合接口返回大结果时，先看 preview，再按需用 `qxb_op_result_query` 局部钻取。
- 财务三表和财务指标主要适用于上市企业或有公开财务披露的主体，未命中时要主动降级解释。

## Core API Shortlist

### 主体识别与经营底座

- `cn_company_registration_face` (`1.41`, 参数 `keyword`)
作用：核正式名称、统一社会信用代码、法定代表人、注册资本、经营状态、成立日期、经营范围。

- `cn_company_triple_codes` (`79.34`, 参数 `name`)
作用：补齐统一社会信用代码、组织机构代码、注册号；适合做主体强标识交叉确认。

- `cn_company_registration_report` (`1.8`)
作用：补企业基础工商信息全景；适合授信底稿的基础摘要块。

- `cn_company_contact_info` (`1.51`, 参数 `keyword`)
作用：核地址、电话、邮箱等联系方式；适合判断“公开可核资料”是否齐全。

- `cn_company_profile`
作用：补企业简介；适合为经营概况段落提供简洁背景。

- `cn_company_main_business`
作用：补主营业务；适合授信视角下的经营方向描述。

- `cn_company_industry_nec` (`79.13`)
作用：补行业分类；适合辅助行业判断。

- `cn_company_scale` (`79.12`)
作用：补企业规模；适合辅助经营支撑度判断。

- `cn_company_entity_nature` (`91.66`)
作用：补主体性质；适合识别国资、民营、混合或其他属性。

- `cn_company_capital_background` (`79.11`)
作用：补资本背景；适合授信底稿的资本与背景说明。

- `cn_branch_parent_check` (`79.18`, 参数 `name`)
作用：用分支名称反查总公司；适合处理“授信对象是分支还是总公司”。

- `cn_company_branches` (`1.49`, 参数 `keyword`, `skip`)
作用：从总公司向下核分支布局；适合判断分支覆盖和主体层级。

- `cn_company_historical_names` (`24.28`, 参数 `keyword`, `skip`)
作用：核曾用名；适合桥接旧营业执照、旧合同、旧品牌线索。

- `cn_company_change_records` (`1.47`, 参数 `keyword`, `skip`, `type_code`)
作用：解释名称、地址、负责人、经营范围、联系方式等变化。

- `cn_company_migration` (`79.26`, 参数 `name`, `skip`)
作用：核迁移历史；适合处理旧地址和异地迁址争议。

### 控制链与关联布局

- `cn_company_shareholders_ic` (`1.43`)
作用：查工商股东；适合建立股权结构基础表。

- `cn_company_key_personnel` (`1.45`)
作用：查主要人员；适合管理层和关键人物章节。

- `cn_company_actual_controllers` (`55.5`)
作用：查实际控制人；适合授信控制链判断。

- `cn_company_beneficial_owners` (`55.3`)
作用：查实际受益人及受益比例；适合受益所有人补充。

- `cn_company_controlled_companies` (`33.13`)
作用：查实际控制企业；适合同实控圈层判断。

- `cn_company_group_members` (`31.29`)
作用：查集团成员；适合集团化主体。

- `cn_company_group_graph` (`61.45`)
作用：看集团图谱；适合快速理解母子结构。

- `cn_company_outbound_investments` (`37.17`)
作用：查对外投资；适合补充关联布局和扩张方向。

### 经营支撑与资质许可

- `cn_company_certificates` (`22.1`, 参数 `name`, `skip`)
作用：查企业资质证书及有效期；适合判断基础准入或场景资质是否齐备。

- `cn_company_administrative_licenses` (`39.2`, 参数 `name`, `skip`)
作用：查行政许可及有效期；适合处理经营许可类要求。

- `cn_company_tax_a_grade` (`52.1`, 参数 `keyword`)
作用：查纳税 A 级记录；适合作为经营质量和规范性辅助信号。

- `cn_company_taxpayer_type` (`52.3`, 参数 `keyword`)
作用：查纳税人类型；适合作为经营主体类型补充。

- `cn_company_social_insurance` (`3.3`, 参数 `keyword`)
作用：查工商年报披露的社保信息；适合作为用工和经营支撑辅助线索。

- `cn_company_domains` (`16.1`, 参数 `name`)
作用：查备案域名；适合作为官网和线上经营痕迹补充。

- `cn_company_annual_report_websites` (`1.53`, 参数 `keyword`, `skip`)
作用：查年报网址；适合补网站线索和年报披露痕迹。

- `cn_company_financial_qualifications`
作用：查金融资质和牌照；仅在金融、支付、保险、基金等场景按需补充。

- `cn_company_telecom_licenses`
作用：查电信许可；仅在互联网、电信服务等场景按需补充。

- `cn_company_construction_qualifications`
作用：查工程资质；仅在工程建设类主体按需补充。

### 财务与授信辅助

- `cn_company_credit_score` (`30.4`, 参数 `name`)
作用：查启信分详情；`score >= 500` 通常较优，`score < 300` 为高风险信号。

- `cn_company_composite_risk` (`72.51`, 参数 `keyword`)
作用：查综合风险分；分值越高风险越高。

- `cn_company_contract_default_index` (`66.21`, 参数 `keyword`)
作用：查合同违约指数；适合作为履约风险辅助信号。

- `cn_company_shell_index` (`82.3`, 参数 `name`)
作用：查空壳指数；适合识别僵尸、皮包或异常经营嫌疑。

- `cn_company_entity_credit_rating` (`43.4`, 参数 `name`)
作用：查主体信用评级；仅在有评级信息时补充。

- `cn_company_financial_key_indicators` (`68.17`, 参数 `name`, `skip`)
作用：查财务主要指标；适合上市企业或有公开财务披露的主体。

- `cn_company_balance_sheets` (`68.19`, 参数 `name`, `skip`)
作用：查资产负债表；适合分析资产、负债和所有者权益。

- `cn_company_income_statements` (`68.18`, 参数 `name`, `skip`)
作用：查利润表；适合分析收入、利润和盈利趋势。

- `cn_company_cash_flow_statements` (`68.20`, 参数 `name`, `skip`)
作用：查现金流量表；适合分析经营现金流和净现金流。

### 风险排查

- `cn_company_abnormal_operations` (`1.55`, 参数 `keyword`, `skip`)
作用：查经营异常；适合作为授信底稿的基础阻断检查之一。

- `cn_company_serious_illegal` (`56.1`, 参数 `name`)
作用：查严重违法失信相关记录；适合作为硬风险升级信号。

- `cn_company_justice_risk` (`79.23`)
作用：查司法风险评分；分值越低越好。

- `cn_company_risk_statistics` (`27.59`)
作用：查企业风险统计；适合先看全局风险规模。

- `cn_company_executed`
作用：查被执行记录；适合执行风险补充。

- `cn_company_dishonest_executed`
作用：查失信被执行；适合硬风险核查。

- `cn_company_high_consumption_restrictions`
作用：查限制高消费；适合补充执行后果。

- `cn_company_tax_arrears`
作用：查欠税信息；适合税务风险核查。

- `cn_company_abnormal_taxpayers`
作用：查非正常户；适合税务经营异常核查。

- `cn_company_major_tax_illegal`
作用：查重大税收违法；适合作为高敏风险信号。

- `cn_company_administrative_penalties`
作用：查行政处罚；适合合规风险核查。

- `cn_company_chattel_mortgages`
作用：查动产抵押；适合资产负担补充。

- `cn_company_equity_pledges`
作用：查股权出质；适合作为股权层面负担线索。

- `cn_company_equity_freezes`
作用：查股权冻结；适合作为控制链和资产负担风险信号。

- `cn_company_judicial_assistance`
作用：查司法协助；适合作为司法限制补充。

- `cn_company_termination_cases`
作用：查终本案件；适合作为执行长期未结风险补充。

- `cn_company_bankruptcy_cases`
作用：查破产案件；适合作为高敏风险信号。

### 外部经营与供应链

- `cn_company_suppliers` (`77.1`, 参数 `name`, `skip`)
作用：查供应商名单；适合补充采购侧经营线索。

- `cn_company_customers` (`77.2`, 参数 `name`, `skip`)
作用：查客户名单；适合补充销售侧经营线索。

- `cn_company_supply_chain` (`79.41`, 参数 `name`, `skip`, 可选 `relationship_code`)
作用：查上下游关系、交易金额和占比；适合供应链授信或交易背景类场景。

## Recommended Route By Question

- `标准授信底稿`
路线：`企业解析 -> 工商照面 -> 三码 -> 基础工商报告 -> 联系方式 -> 股东/主要人员 -> 实控/受益人 -> 资质许可 -> 启信分/综合风险分 -> 异常经营/严重违法`

- `授信对象涉及分支、集团或多主体`
路线：`企业解析 -> 分支总公司核查 -> 分支机构 -> 集团成员/集团图谱 -> 实际控制企业 -> 对外投资`

- `授信更关注财务公开数据`
路线：`企业解析 -> 上市/公开披露线索确认 -> 财务主要指标 -> 资产负债表 -> 利润表 -> 现金流量表 -> 主体评级`

- `授信更关注风险暴露`
路线：`企业解析 -> 风险统计 -> 异常经营 -> 严重违法 -> 司法风险评分 -> 执行/失信/限高 -> 税务风险 -> 行政处罚 -> 股权与资产负担`

- `授信更关注真实经营和交易背景`
路线：`企业解析 -> 主营业务 -> 联系方式/域名 -> 纳税 A 级/社保 -> 客户 -> 供应商 -> 上下游 -> 对外投资`

- `需要一次性看多个板块但不想全量堆接口`
路线：`客户信息尽调 -> preview -> qxb_op_result_query 按块下钻`

- `需要一次性排查多类风险`
路线：`合作风险排查 -> preview -> qxb_op_result_query 按风险块下钻`

## Aggregate Query Patterns

只在使用聚合接口时参考：

### `cn_customer_due_diligence`

- `$.data.ent_info`
作用：企业基础档案

- `$.data.group_info`
作用：集团和母子关系摘要

- `$.data.listed_info`
作用：上市信息摘要

- `$.data.branches_list[0:10]`
作用：分支机构摘要

- `$.data.domain_list[0:10]`
作用：域名信息摘要

- `$.data.financing_list[0:10]`
作用：融资历史摘要

### `cn_cooperation_risk_scan`

- `$.data.ent_info`
作用：企业主体与基础信息摘要

- `$.data.judgement_list[0:10]`
作用：裁判文书摘要

- `$.data.enforcement_list[0:10]`
作用：被执行摘要

- `$.data.restricted_consumer_list[0:10]`
作用：限制高消费摘要

- `$.data.administrative_punishment_list[0:10]`
作用：行政处罚摘要

- `$.data.overduetaxs_list[0:10]`
作用：欠税信息摘要

## Gate-Oriented Interpretation

- 工商照面状态正常，只能说明“公开工商状态仍在存续”；不等于授信风险低。
- 财务公开数据缺失，只能说明“公开披露有限”；不等于企业经营差。
- 启信分、综合风险分、合同违约指数、空壳指数只能辅助判断，不直接等于授信结论。
- 客户、供应商、上下游信息只能支撑“外部经营线索”，不直接等于已核验的交易事实。
- 没有查到资质或许可，不等于法律上绝对没有；应写“当前公开可核信息未见”，并建议结合用户内部资料复核。

## Fallback Strategy

- 基础工商信息足够确认主体时，先停下来写底稿，不要自动扩成大而全报告。
- 多个候选仍接近时，优先补一个更强线索，而不是继续堆弱证据。
- 用户只关心“能否进入下一步授信评审”时，优先给出结论、风险摘要和待补材料，而不是无上限扩写。
- 主体不是中国企业，或问题已转为法律、财务审计、现场尽调等能力边界外事项时，明确说明边界并停止当前流程。
