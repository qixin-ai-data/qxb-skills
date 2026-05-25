# 接口映射与业务用途

本 skill 默认先用较轻量的接口做银行授信拓客初筛。

## 主体解析

- `qxb_op_enterprise_resolve`
  先确认主体，再做后续评分。

## 融资需求信号

- `cn_company_commercial_clues`
  用于读取是否存在融资、授信、开户、存款等商机标签和线索等级，是需求判断的核心信号。

- `cn_company_news`
  用于识别企业近期扩张、活跃、项目推进等信号，辅助判断资金需求可能性。

## 企业基本面与经营承接力

- `cn_company_industry_nec`
  用于判断行业属性。

- `cn_company_main_business`
  用于判断主营业务清晰度和业务方向。

- `cn_company_scale`
  用于判断企业体量。

- `cn_company_credit_score`
  用于读取启信分、实力分、风险分，辅助评估经营质量。

## 客户经理可触达性

- `cn_company_contact_info`
  用于读取公开电话、邮箱、地址等信息。

## 风险与准入约束

- `cn_company_composite_risk`
  用于快速读取综合风险分。

- `cn_cooperation_risk_scan`
  仅在需要更严格风险排查时补充使用，不默认展开全部细项。
