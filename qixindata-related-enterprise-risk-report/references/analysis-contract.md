# Analysis Contract

在写正文前，先在内部整理一个标准对象。至少覆盖以下字段：

```json
{
  "target_entity": {
    "name": "",
    "credit_no": "",
    "status": "",
    "oper_name": "",
    "industry": "",
    "group_name": ""
  },
  "baseline_snapshot": {
    "related_entity_count": 0,
    "controlled_company_count": 0,
    "beneficial_owner_count": 0,
    "self_risk_count": 0,
    "related_risk_count": 0,
    "judicial_risk_count": 0,
    "manage_risk_count": 0
  },
  "relationship_layers": {
    "strong": [],
    "medium": [],
    "weak": []
  },
  "key_people": [],
  "priority_related_entities": [],
  "propagation_paths": [],
  "top_risk_evidence": [],
  "overall_level": "",
  "boundary_notes": [],
  "client_actions": []
}
```

## Field Rules

### `relationship_layers`

每个主体至少记录：

- `entity_name`
- `relation_type`
- `relation_strength`
- `source_interfaces`
- `why_included`

### `priority_related_entities`

只保留真正进入风险判断的样本。每个主体至少记录：

- `entity_name`
- `role_in_network`
- `risk_summary`
- `is_core_path`
- `needs_detail_lookup`

### `propagation_paths`

每条链至少记录：

- `from_entity`
- `to_target`
- `path_type`
- `path_description`
- `risk_type`
- `severity`
- `propagation_level`
- `evidence`

### `top_risk_evidence`

每条证据至少记录：

- `subject`
- `relation_to_target`
- `risk_event`
- `event_time`
- `signal_strength`
- `why_it_matters`

## Adjudication Rule

`overall_level` 只能取：

- `高传导风险`
- `中传导风险`
- `低传导风险`
- `当前证据不足`

判级优先看：

1. 关系强度
2. 风险严重度
3. 风险是否持续/集中
4. 是否直达目标主体控制链或关键人物链

不要把“主体自身风险高”直接等同于“关联传导风险高”。
