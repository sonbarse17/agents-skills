---
name: pydantic-models-py
description: Create Pydantic models following the multi-model pattern with Base,
  Create, Update, Response, and InDB variants. Use when defining API
  request/response schemas, database models, or data validation in Python
  applications using Pydantic v2.
license: MIT
metadata:
  author: Microsoft
  version: 1.0.0
tags:
  - skills
  - pydantic-models-py
depends_on: []
---

# Pydantic Models

Create Pydantic models following the multi-model pattern for clean API contracts.

## Quick Start

Copy the template from [assets/template.py](assets/template.py) and replace placeholders:
- `{{ResourceName}}` → PascalCase name (e.g., `Project`)
- `{{resource_name}}` → snake_case name (e.g., `project`)

## Multi-Model Pattern

| Model | Purpose |
|-------|---------|
| `Base` | Common fields shared across models |
| `Create` | Request body for creation (required fields) |
| `Update` | Request body for updates (all optional) |
| `Response` | API response with all fields |
| `InDB` | Database document with `doc_type` |

## camelCase Aliases

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class MyModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    workspace_id: str = Field(..., alias="workspaceId")
    created_at: datetime = Field(..., alias="createdAt")
```

## Optional Update Fields

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
class MyUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
```

## Database Document

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
class MyInDB(MyResponse):
    doc_type: str = "my_resource"
```

## Integration Steps

1. Create models in `src/backend/app/models/`
2. Export from `src/backend/app/models/__init__.py`
3. Add corresponding [TypeScript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md) types

## Reference Files

| File | Contents |
|------|----------|
| [../../../../../Global_References/pydantic-models-py_capabilities.md](../../../../../Global_References/pydantic-models-py_capabilities.md) | Additional non-hero capabilities, operation-group coverage, and production checklists. |

