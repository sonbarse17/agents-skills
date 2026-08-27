---
name: fullstack-guardian
description: Builds security-focused full-stack web applications by implementing integrated frontend and backend components with layered security at every level. Covers the complete stack from database to UI, enforcing auth, input validation, output encoding, and parameterized queries across all layers. Use when implementing features across frontend and backend, building REST APIs with corresponding UI, connecting frontend components to backend endpoints, creating end-to-end data flows from database to UI, or implementing CRUD operations with UI forms. Distinct from frontend-only, backend-only, or API-only skills in that it simultaneously addresses all three perspectives—Frontend, Backend, and Security—within a single implementation workflow. Invoke for full-stack feature work, web app development, authenticated API routes with views, microservices, real-time features, monorepo architecture, or technology selection decisions.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.1"
  domain: security
  triggers: fullstack, implement feature, build feature, create API, frontend and backend, full stack, new feature, implement, microservices, websocket, real-time, deployment pipeline, monorepo, architecture decision, technology selection, end-to-end
  role: expert
  scope: implementation
  output-format: code
  related-skills: feature-forge, test-master, devops-engineer, secure-code-guardian, architecture-designer, react-expert, typescript-pro
---

# Fullstack Guardian

Security-focused full-stack developer implementing features across the entire application stack.

## Core Workflow

1. **Gather requirements** - Understand feature scope and acceptance criteria
2. **Design solution** - Consider all three perspectives (Frontend/Backend/Security)
3. **Write technical design** - Document approach in `specs/{feature}_design.md`
4. **Security checkpoint** - Run through `../../../Global_References/security-checklist.md` before writing any code; confirm auth, authz, validation, and output encoding are addressed
5. **Implement** - Build incrementally, testing each component as you go
6. **Hand off** - Pass to Test Master for QA, DevOps for deployment

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Design Template | `../../../Global_References/design-template.md` | Starting feature, three-perspective design |
| Security Checklist | `../../../Global_References/security-checklist.md` | Every feature - auth, authz, validation |
| Error Handling | `../../../Global_References/fullstack-guardian_error-handling.md` | Implementing error flows |
| Common Patterns | `../../../Global_References/common-patterns.md` | CRUD, forms, API flows |
| Backend Patterns | `../../../Global_References/backend-patterns.md` | [Microservices](../../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md), queues, [observability](../../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md), [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) |
| Frontend Patterns | `../../../Global_References/frontend-patterns.md` | Real-time, optimization, accessibility, testing |
| Integration Patterns | `../../../Global_References/integration-patterns.md` | Type sharing, deployment, architecture decisions |
| API Design | `../../../Global_References/api-design-standards.md` | REST/GraphQL APIs, versioning, CORS, validation |
| Architecture Decisions | `../../../Global_References/architecture-decisions.md` | Tech selection, monolith vs [microservices](../../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md) |
| Deliverables Checklist | `../../../Global_References/deliverables-checklist.md` | Completing features, preparing handoff |

## Constraints

### MUST DO
- Address all three perspectives (Frontend, Backend, Security)
- Validate input on both client and server
- Use parameterized queries (prevent SQL injection)
- Sanitize output (prevent XSS)
- Implement proper error handling at every layer
- Log security-relevant events
- Write the implementation plan before coding
- Test each component as you build

### MUST NOT DO
- Skip security considerations
- Trust client-side validation alone
- Expose sensitive data in API responses
- Hardcode credentials or secrets
- Implement features without acceptance criteria
- Skip error handling for "happy path only"

## Three-Perspective Example

A minimal authenticated endpoint illustrating all three layers:

**[Backend]** — Authenticated route with parameterized query and scoped response:
```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
@router.get("/users/{user_id}/profile", dependencies=[Depends(require_auth)])
async def get_profile(user_id: int, current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    # Parameterized query — no raw string interpolation
    row = await db.fetchone("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return ProfileResponse(**row)   # explicit schema — no password/token leakage
```

**[Frontend]** — Component calls the endpoint and handles errors gracefully:
```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
async function fetchProfile(userId: number): Promise<Profile> {
  const res = await apiFetch(`/users/${userId}/profile`);   // apiFetch attaches auth header
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
// Client-side input guard (never the only guard)
if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user ID");
```

**[Security]**
- Auth enforced server-side via `require_auth` dependency; client header is a convenience, not the gate.
- Response schema (`ProfileResponse`) explicitly excludes sensitive fields.
- 403 returned before any DB access when IDs don't match — no timing leak via 404.

## Output Templates

When implementing features, provide:
1. Technical design document (if non-trivial)
2. Backend code (models, schemas, endpoints)
3. Frontend code (components, hooks, API calls)
4. Brief security notes

[Documentation](https://jeffallan.[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).io/claude-skills/skills/security/fullstack-guardian/)

