# Analysis Contract

## Purpose

本文件用于把“同一组数据”先压缩成固定结构的内部分析对象，再交给报告模板渲染。不同模型必须先完成这一层，才能进入客户报告写作。

## Mandatory Workflow

1. 先抽取事实，不写长段落。
2. 再把事实填入固定字段。
3. 再按证据映射规则生成结论等级。
4. 最后再用模板和句库生成报告。

禁止直接跳过标准化对象，直接写整篇报告。

## Fixed Schema

以下字段必须全部出现，顺序不得变化：

```yaml
report_scope: pair | multi
report_date: YYYY-MM-DD
entities:
  - role: subject_a | subject_b | subject_n
    name: ""
    credit_code: ""
    org_code: ""
    reg_no: ""
    region: ""
    status: ""
    resolution_note: ""
snapshot:
  - name: ""
    related_entity_count: ""
    beneficiary_count: ""
    controlled_entity_count: ""
    ic_risk_overview: ""
evidence_slots:
  direct_ownership:
    status: hit | miss | limited
    grade: strong | none
    facts: []
  control_chain:
    status: hit | miss | limited
    grade: strong | medium_strong | none
    facts: []
  beneficial_owner:
    status: hit | miss | limited
    grade: strong | medium_strong | none
    facts: []
  group_network:
    status: hit | miss | limited
    grade: medium_strong | auxiliary | none
    facts: []
  shared_people:
    status: hit | miss | limited
    grade: medium_strong | auxiliary | none
    facts: []
  auxiliary_signals:
    status: hit | miss | limited
    grade: auxiliary | none
    facts: []
  risk_spillover:
    status: hit | miss | limited
    grade: auxiliary | none
    facts: []
final_level: 已确认直接关联 | 已确认间接关联 | 存在较强关联信号 | 当前未检索到足够公开证据
top_3_evidence:
  - ""
  - ""
  - ""
boundary_notes:
  - ""
  - ""
client_actions:
  - ""
  - ""
  - ""
  - ""
final_one_sentence: ""
```

## Field Rules

- `entities` 中所有主体都要写三码和状态；缺失就写“公开资料暂未完整显示”。
- `facts` 只写可核验事实，不写修辞，不写判断词。
- `top_3_evidence` 固定为 3 条，优先填强证据；不足时用句库中的缺省话术补齐。
- `boundary_notes` 固定为 2 条，分别优先写“证据边界”和“仍需关注点”。
- `client_actions` 固定为 4 条，分别对应：准入口径、观察范围、进一步确认、持续复核。

## Extraction Rules

- 每条事实尽量包含主体名、比例、路径、时间或风险类型中的至少一个。
- 对同一事实不要重复改写，优先保留最短、最明确的版本。
- 聚合结果如果没有基础证据支撑，只能写入 `group_network` 或 `auxiliary_signals`，不能直接推动更高结论等级。
- 辅助信号可以入槽，但不能代替主链证据。

## Rendering Rules

- 报告中每一章的内容，都必须能回溯到某个固定字段或固定槽位。
- 如果某章无有效事实，不要自由发挥，直接使用句库缺省表达。
- 最终 Markdown 应该是“标准对象的受控展开”，而不是重新写一篇自由文章。

