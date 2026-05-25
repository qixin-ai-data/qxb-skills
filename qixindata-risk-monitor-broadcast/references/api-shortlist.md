# 接口短名单

使用这份短名单，保证日常监控尽量便宜、稳定、可重复。

## 默认核心接口

默认使用以下接口：

| api_ref | api_id | 作用 |
| --- | --- | --- |
| `cn_company_change_records` | `1.47` | 每日工商增量变化监控，覆盖名称、类型、注册资本、地址、经营范围、法定代表人、股东股权、人员、分支机构、期限等变化。 |
| `cn_cooperation_risk_scan` | `55.29` | 聚合风险扫描，优先覆盖司法、执行、限高、处罚、税务、经营异常等风险块。 |
| `cn_company_news` | `10.1` | 新闻、舆情、情感属性、事件标签监控。 |
| `cn_customer_due_diligence` | `47.51` | 首轮基线快照接口。只有在需要重新建立全量基线时再复用。 |

## 关联方扩展

只有在用户明确要求监控关联方传导风险时才使用：

| api_ref | api_id | 作用 |
| --- | --- | --- |
| `cn_company_actual_controllers` | `55.5` | 实际控制人 |
| `cn_company_beneficial_owners` | `55.3` | 实际受益人 |
| `cn_company_suspected_related_parties` | `33.9` | 疑似关联方 |
| `cn_company_group_members` | `31.29` | 集团成员 |

完成关联实体发现后，优先复用 `cn_cooperation_risk_scan` 对短名单实体做风险扫描，而不是切换成大量并行细分接口。

## 供应链扩展

只有在用户明确要求监控供应链传导风险时才使用：

| api_ref | api_id | 作用 |
| --- | --- | --- |
| `cn_company_supply_chain` | `79.41` | 主要的上下游关系来源 |
| `cn_company_suppliers` | `77.1` | 供应商列表补充 |
| `cn_company_customers` | `77.2` | 客户列表补充 |

完成对手方发现后，只对最重要的上下游对象复用 `cn_cooperation_risk_scan` 做风险扫描。

## 精确下钻接口

只有在某一类规则需要精确核实时才使用：

| api_ref | api_id | 作用 |
| --- | --- | --- |
| `cn_company_registration_face` | `1.41` | 工商照面 |
| `cn_company_shareholders_ic` | `1.43` | 工商股东 |
| `cn_company_key_personnel` | `1.45` | 主要人员 |
| `cn_company_branches` | `1.49` | 分支机构 |
| `cn_company_contact_info` | `1.51` | 地址、电话、邮箱 |
| `cn_company_domains` | `16.1` | 域名信息 |
| `cn_company_outbound_investments` | `37.17` | 对外投资 |
| `cn_company_abnormal_operations` | `1.55` | 经营异常 |
| `cn_company_serious_illegal` | `56.1` | 严重违法失信 |
| `cn_company_administrative_penalties` | `32.1` | 行政处罚 |
| `cn_company_environmental_penalties` | `51.1` | 环保处罚 |
| `cn_company_tax_arrears` | `20.1` | 欠税信息 |
| `cn_company_abnormal_taxpayers` | `63.2` | 非正常户 |
| `cn_company_major_tax_illegal` | `20.3` | 重大税收违法 |
| `cn_company_equity_pledges` | `26.1` | 股权出质 |
| `cn_company_equity_freezes` | `34.1` | 股权冻结 |
| `cn_company_chattel_mortgages` | `25.1` | 动产抵押 |
| `cn_company_case_filing` | `47.4` | 立案信息 |
| `cn_company_hearing_notices` | `19.1` | 开庭公告 |
| `cn_company_court_announcements` | `9.1` | 法院公告 |
| `cn_company_executed` | `17.5` | 被执行人 |
| `cn_company_dishonest_executed` | `5.5` | 失信被执行人 |
| `cn_company_judicial_auctions` | `7.1` | 司法拍卖 |
| `cn_company_bankruptcy_cases` | `51.4` | 破产案件 |
| `cn_company_deregistration_records` | `36.53` | 注销备案 |

## 经营与知识产权扩展

只有在用户明确要求覆盖这些已映射工作簿规则族时才使用：

| api_ref | api_id | 作用 |
| --- | --- | --- |
| `cn_company_bidding_list` | `21.4` | 招投标 |
| `cn_company_recruitment` | `11.1` | 招聘信息 |
| `cn_company_administrative_licenses` | `39.2` | 行政许可 |
| `cn_company_inspection_checks` | `38.2` | 抽查检查 |
| `cn_company_double_random_checks` | `38.3` | 双随机抽查 |
| `cn_company_tax_a_grade` | `52.1` | A 级纳税人 |
| `cn_company_customs_credit_rating` | `57.83` | 进出口信用评级 |
| `cn_company_trademarks` | `12.1` | 商标信息 |
| `cn_company_patents` | `8.1` | 专利信息 |
| `cn_company_copyrights` | `14.1` | 著作权 |
| `cn_company_software_copyrights` | `15.1` | 软件著作权 |

除非用户明确要求更宽的经营与知识产权监控，否则不要把这一整块加入默认的每日运行。
