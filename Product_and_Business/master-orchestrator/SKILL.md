---
name: master-orchestrator
description: >
  Use this skill when the user says 'start', 'help me build', 'initialize', 'I want to build X', 'where do I start', 'what should I do next', 'what skill should I use', or any open-ended project initiation. This is the single entry point for the entire skill suite. It inspects the project filesystem for existing artifacts and routes to the correct next skill. Do NOT use for: direct implementation, bug reports, code review requests, or deployment questions. Those route to their respective skills directly.
version: "1.0.0"
author: "j4flmao"
license: "MIT"
compatibility:
  claude-code: true
  cursor: true
  codex: true
  windsurf: true
tags: [orchestration, phase-0, entry-point]
---

# Master Orchestrator

## Purpose
Inspect project state and route to the correct skill. This skill NEVER implements, debugs, or designs. It only routes.

## Agent Protocol

### Trigger
Exact user phrases: "start", "help me build", "initialize", "I want to build X", "where do I start", "what skill", "what should I do next", "begin", "let's start".

### Input Context
- Working directory must be set to the project root.
- If no project root is detectable, ask the user: "Where is your project directory?"

### Output Artifact
None. This skill produces no files. It emits a routing decision as text.

### Response Format
The agent MUST output exactly one of the following templates. No preamble. No postamble. No explanations. No filler/hedging/transitions. Compress output — why use many token when few do trick. No explanations.

Template A — Route to a single skill:
```
Next skill: **{[skill-name](../../DevOps_and_Cloud/Observability_and_SecOps/_template/SKILL.md)}**
Reason: {one sentence exactly}
Context: {key facts the next skill needs}
```

Template B — Route to multiple skills (sequential):
```
Next skills:
1. **{[skill-name](../../DevOps_and_Cloud/Observability_and_SecOps/_template/SKILL.md)}** — {reason}
2. **{[skill-name](../../DevOps_and_Cloud/Observability_and_SecOps/_template/SKILL.md)}** — {reason}
```

Template C — Need more information:
```
Need: {what you need from the user}
Options:
- {option 1}
- {option 2}
```

### Completion Criteria
This skill is complete when:
- [ ] Project state has been checked (docs/, README, package manifests)
- [ ] Stack/language detected or asked
- [ ] A single next skill has been identified
- [ ] Output follows exactly one of the three templates above
- [ ] No implementation, debugging, or advice has been given

### Max Response Length
3 lines maximum for routing. 6 lines maximum for "need more information."

## Workflow

### Step 1: Check Filesystem
Run these checks in order. Stop at the first match.
1. `Test-Path -LiteralPath docs/brief*.md` — brief exists
2. `Test-Path -LiteralPath docs/prd*.md` — PRD exists
3. `Test-Path -LiteralPath docs/decisions/` — ADRs exist
4. `Test-Path -LiteralPath docs/specs/` — tech specs exist
5. `Test-Path -LiteralPath package.json` — Node project
6. `Test-Path -LiteralPath Cargo.toml` — Rust project
7. `Test-Path -LiteralPath go.mod` — Go project
8. `Test-Path -LiteralPath requirements.txt` or `pyproject.toml` — [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) project
9. `Test-Path -LiteralPath pom.xml` or `build.gradle` — Java project

### Step 2: Route by State

State: No docs exist, no README with requirements.
  Route: [create-brief](../create-brief/SKILL.md)
  Reason: "No product definition found. Starting with a brief to define scope."

State: docs/brief exists, no docs/prd.
  Route: [create-prd](../create-prd/SKILL.md)
  Reason: "Brief exists. Expanding into full requirements with epics and stories."

State: docs/prd exists, no docs/decisions or docs/specs.
  Route: create-adr, [create-tech-spec](../create-tech-spec/SKILL.md)
  Reason: "Requirements exist. Need architecture decisions and technical specification before implementation."

State: Architecture docs exist, user describes a backend task.
  1. Detect stack (read package.json / Cargo.toml / go.mod / requirements.txt / pom.xml)
  2. Route to {stack}-architecture and [backend-api-design](../../Software_Engineering_and_Other/Backend/api-design/SKILL.md)

State: Architecture docs exist, user describes a frontend task.
  1. Detect framework (read package.json for react/next/vue/angular)
  2. Route to {framework}-architecture

State: User shows code for review.
  Route: [code-review](../../Software_Engineering_and_Other/Miscellaneous/code-review/SKILL.md)

State: User describes a bug with error message or stack trace.
  Route: debugging-strategy

State: User asks about project management, sprint planning, estimation, or risk.
  Route: management-pm
  Reason: "Project management request. Handling sprint planning, estimation, risk, or reporting."

State: User asks about requirements, user stories, acceptance criteria, or business analysis.
  Route: management-ba
  Reason: "Business analysis request. Writing or refining user stories and acceptance criteria."

State: User asks about test strategy, test cases, defect reporting, or test automation.
  Route: management-qa
  Reason: "Quality assurance request. Designing test strategy, test cases, or defect management."

State: User asks about code quality, quality gates, static analysis, or technical debt.
  Route: management-qc
  Reason: "Quality control request. Enforcing quality gates, static analysis, or technical debt tracking."

State: User asks about SOLID, OOP, DRY, GRASP, or design principles.
  Route: oop-principles
  Reason: "Object-oriented or software design principles request."

State: User asks about design patterns, GoF, pattern selection, creational/structural/behavioral.
  Route: [design-patterns](../../Software_Engineering_and_Other/Patterns/design-patterns/SKILL.md)
  Reason: "Design pattern selection or implementation request."

State: User asks about solution architecture, high-level design, system design, HLD, architecture overview, architecture decision, tech stack decision, cross-cutting concerns.
  Route: solution-architecture
  Reason: "Solution architecture request."

State: User asks about [microservices](../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md), saga, CQRS, event sourcing, service decomposition.
  Route: backend-[microservices](../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md)
  Reason: "[Microservices](../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md) architecture and distributed patterns request."

State: User asks about [microfrontend](../../Software_Engineering_and_Other/Frontend/microfrontend/SKILL.md), Module Federation, frontend composition.
  Route: frontend-[microfrontend](../../Software_Engineering_and_Other/Frontend/microfrontend/SKILL.md)
  Reason: "[Microfrontend](../../Software_Engineering_and_Other/Frontend/microfrontend/SKILL.md) architecture request."

State: User asks about frontend component patterns, hooks patterns, component design.
  Route: frontend-patterns
  Reason: "Frontend design patterns request."

State: User asks about team rules, code review, branch strategy, communication protocol, [incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) response.
  Route: [team-rules](../team-rules/SKILL.md)
  Reason: "Team collaboration protocols request."



State: User asks about API response format, Response<T>, error handling, exception mapping, error codes.
  Route: api-response
  Reason: "API response standardization request."

State: User asks about security team, appsec, vulnerability management, security review, threat model.
  Route: management-security
  Reason: "Security team operations request."

State: User asks about [pentesting](../../DevOps_and_Cloud/Observability_and_SecOps/pentesting/SKILL.md), penetration test, vulnerability assessment, bug bounty.
  Route: management-[pentesting](../../DevOps_and_Cloud/Observability_and_SecOps/pentesting/SKILL.md)
  Reason: "Penetration testing and reporting request."

State: User asks about alert rules, alert fatigue, notification routing, Prometheus alerts, Grafana alerts.
  Route: management-[alerting](../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md)
  Reason: "Alert rule design request."

State: User asks about [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), Prometheus, Grafana, Loki, ELK, metrics, [dashboards](../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md).
  Route: devops-[monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md)
  Reason: "[Monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) stack configuration request."

State: User asks about Helm, Helm chart, values management, chart deployment.
  Route: [helm-patterns](../../DevOps_and_Cloud/Containers_and_Orchestration/helm-patterns/SKILL.md)
  Reason: "Helm chart patterns request."

State: User asks about Terraform, IaC, infrastructure provisioning.
  Route: devops-terraform
  Reason: "Terraform infrastructure patterns request."

State: User asks about [Ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md), playbook, configuration management.
  Route: devops-[ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md)
  Reason: "[Ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md) automation patterns request."

State: User asks about [Jenkins](../../DevOps_and_Cloud/CI_CD/jenkins/SKILL.md), CI/CD pipeline, Jenkinsfile.
  Route: devops-[jenkins](../../DevOps_and_Cloud/CI_CD/jenkins/SKILL.md)
  Reason: "[Jenkins](../../DevOps_and_Cloud/CI_CD/jenkins/SKILL.md) pipeline patterns request."

State: User asks about [Longhorn](../../DevOps_and_Cloud/Observability_and_SecOps/longhorn/SKILL.md), distributed storage, persistent volumes, backup.
  Route: devops-[longhorn](../../DevOps_and_Cloud/Observability_and_SecOps/longhorn/SKILL.md)
  Reason: "[Longhorn](../../DevOps_and_Cloud/Observability_and_SecOps/longhorn/SKILL.md) storage patterns request."

State: Node.js stack detected and user describes a backend task.
  Route: nodejs-architecture
  Reason: "Node.js backend detected. Setting up Express/Fastify/Hono project structure."

State: Node.js stack detected and user asks about patterns, async handlers, DI.
  Route: nodejs-patterns
  Reason: "Node.js patterns request."

State: ElysiaJS stack detected (bun, elysia in dependencies).
  Route: elysia-architecture
  Reason: "ElysiaJS on Bun detected. Setting up Elysia project structure."

State: ElysiaJS user asks about plugins, guards, Eden Treaty.
  Route: elysia-patterns
  Reason: "ElysiaJS patterns request."

State: Ruby on Rails stack detected (Gemfile, rails).
  Route: backend-rails
  Reason: "Ruby on Rails backend detected."

State: PHP stack detected (composer.json, PHP files).
  1. Read composer.json for framework.
  2. Route to [php-laravel](../../Software_Engineering_and_Other/Backend/laravel/SKILL.md) if "laravel/framework" in require.
  3. Route to [php-zend](../../Software_Engineering_and_Other/Backend/zend/SKILL.md) if "laminas/laminas-mvc" or "zendframework/zend-mvc" in require.
  4. Route to [php-pure](../../Software_Engineering_and_Other/Miscellaneous/pure/SKILL.md) otherwise.
  Reason: "PHP stack detected. Routing to appropriate PHP framework."

State: User asks about Laravel, Artisan, Eloquent, Blade.
  Route: [php-laravel](../../Software_Engineering_and_Other/Backend/laravel/SKILL.md)
  Reason: "Laravel framework request."

State: User asks about Zend, Laminas, Zend Framework, ZF3.
  Route: [php-zend](../../Software_Engineering_and_Other/Backend/zend/SKILL.md)
  Reason: "Zend/Laminas framework request."

State: User asks about plain PHP, pure PHP, PHP without framework, PSR-7, PSR-15.
  Route: [php-pure](../../Software_Engineering_and_Other/Miscellaneous/pure/SKILL.md)
  Reason: "Plain PHP request."

State: User asks about Symfony, Symfony framework, Symfony DI, Doctrine.
  Route: php-symfony
  Reason: "Symfony framework request."

State: [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) stack detected with Django (Django in dependencies).
  Route: [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-django
  Reason: "Django backend detected."

State: [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) stack detected with FastAPI (fastapi in dependencies).
  Route: [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-fastapi
  Reason: "FastAPI backend detected."

State: [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) stack detected with Flask (flask in dependencies).
  Route: [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-flask
  Reason: "Flask backend detected."

State: User asks about Hono, Hono backend, Hono middleware.
  Route: [nodejs-hono](../../Software_Engineering_and_Other/Backend/hono/SKILL.md)
  Reason: "Hono backend request."

State: User asks about Fastify, Fastify backend, Fastify plugins.
  Route: [nodejs-fastify](../../Software_Engineering_and_Other/Backend/fastify/SKILL.md)
  Reason: "Fastify backend request."

State: Deno stack detected with Oak (oak in imports).
  Route: deno-oak
  Reason: "Deno Oak backend detected."

State: Swift stack detected with Vapor (Vapor in Package.swift).
  Route: swift-vapor
  Reason: "Swift Vapor backend detected."

State: Scala stack detected with Play (Play Framework in build.sbt).
  Route: [scala-play](../../Software_Engineering_and_Other/Backend/play/SKILL.md)
  Reason: "Scala Play backend detected."

State: Java stack detected with [Micronaut](../../Software_Engineering_and_Other/Backend/micronaut/SKILL.md) ([micronaut](../../Software_Engineering_and_Other/Backend/micronaut/SKILL.md) in build config).
  Route: java-[micronaut](../../Software_Engineering_and_Other/Backend/micronaut/SKILL.md)
  Reason: "[Micronaut](../../Software_Engineering_and_Other/Backend/micronaut/SKILL.md) backend detected."

State: Java stack detected with Quarkus (quarkus in build config).
  Route: java-quarkus
  Reason: "Quarkus backend detected."

State: Kotlin stack detected (kotlin in build config, no [Android](../../Mobile/android/SKILL.md)).
  Route: backend-kotlin-architecture
  Reason: "Kotlin backend detected."

State: [SvelteKit](../../Software_Engineering_and_Other/Frontend/sveltekit/SKILL.md) stack detected (package.json has @sveltejs/kit).
  Route: frontend-[sveltekit](../../Software_Engineering_and_Other/Frontend/sveltekit/SKILL.md)
  Reason: "[SvelteKit](../../Software_Engineering_and_Other/Frontend/sveltekit/SKILL.md) frontend detected."

State: .NET stack detected and user describes a backend task.
  Route: dotnet-architecture
  Reason: "C# .NET backend detected. Setting up project structure and architecture."

State: .NET stack detected and user asks about patterns, CQRS, MediatR, EF Core patterns.
  Route: dotnet-patterns
  Reason: "C# .NET patterns request. Implementing CQRS, Result pattern, or pipeline behaviors."

State: NestJS stack detected and user asks about patterns, modules, guards, interceptors.
  Route: nestjs-patterns
  Reason: "NestJS patterns request."

State: NestJS stack detected and user asks about NestJS project structure, modules architecture.
  Route: nestjs-architecture
  Reason: "NestJS architecture request."

State: Go stack detected and user asks about patterns, concurrency, error handling, idiomatic Go.
  Route: backend-go-patterns
  Reason: "Go patterns request."

State: Go stack detected and user asks about Go project structure, Go architecture.
  Route: backend-go-architecture
  Reason: "Go architecture request."

State: Kotlin stack detected and user asks about Kotlin patterns.
  Route: backend-kotlin-patterns
  Reason: "Kotlin patterns request."

State: Spring Boot stack detected and user asks about Spring Boot patterns, Spring beans.
  Route: backend-spring-boot-patterns
  Reason: "Spring Boot patterns request."

State: Spring Boot stack detected and user asks about Spring Boot project structure.
  Route: backend-spring-boot-architecture
  Reason: "Spring Boot architecture request."

State: Rust stack detected and user asks about patterns, error handling, ownership, async Rust.
  Route: rust-patterns
  Reason: "Rust patterns request."

State: Rust stack detected and user asks about Rust project structure, Rust modules.
  Route: rust-architecture
  Reason: "Rust architecture request."

State: Angular detected and user asks about patterns, RxJS, NgRx, modules.
  Route: angular-patterns
  Reason: "Angular patterns request."

State: Angular detected and user asks about Angular project structure, Angular architecture.
  Route: angular-architecture
  Reason: "Angular architecture request."

State: React detected and user asks about React project structure, React architecture.
  Route: react-architecture
  Reason: "React architecture request."

State: React detected and Next.js in dependencies.
  Route: [react-nextjs](../../Software_Engineering_and_Other/Frontend/nextjs/SKILL.md)
  Reason: "React Next.js request."

State: Vue detected and user asks about Vue project structure, Vue architecture.
  Route: [vue-architecture](../../Software_Engineering_and_Other/Patterns/architecture/SKILL.md)
  Reason: "Vue architecture request."

State: Vue detected and Nuxt in dependencies.
  Route: [vue-nuxt](../../Software_Engineering_and_Other/Frontend/nuxt/SKILL.md)
  Reason: "Vue Nuxt request."

State: Svelte detected and user asks about Svelte project structure, Svelte architecture.
  Route: svelte-architecture
  Reason: "Svelte architecture request."

State: Svelte detected and user asks about Svelte patterns, Svelte runes, Svelte 5.
  Route: svelte-patterns
  Reason: "Svelte patterns request."

State: SolidJS detected and user asks about SolidJS project structure.
  Route: solidjs-architecture
  Reason: "SolidJS architecture request."

State: SolidJS detected and user asks about SolidJS patterns, Solid signals.
  Route: solidjs-patterns
  Reason: "SolidJS patterns request."

State: Qwik detected and user asks about Qwik project structure, Qwik City.
  Route: qwik-architecture
  Reason: "Qwik architecture request."

State: Remix detected and user asks about Remix architecture.
  Route: remix-architecture
  Reason: "Remix architecture request."

State: Remix detected and user asks about Remix patterns, Remix loaders.
  Route: remix-patterns
  Reason: "Remix patterns request."

State: User asks about [Docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md), Dockerfile, [docker-compose](../../DevOps_and_Cloud/Containers_and_Orchestration/[docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-compose/SKILL.md), [containerization](../../DevOps_and_Cloud/Containers_and_Orchestration/containerization/SKILL.md).
  Route: [docker-patterns](../../DevOps_and_Cloud/Containers_and_Orchestration/[docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-patterns/SKILL.md)
  Reason: "[Docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) [containerization](../../DevOps_and_Cloud/Containers_and_Orchestration/containerization/SKILL.md) request."

State: User says deploy, CI/CD, [GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Actions, GitLab CI, pipeline automation.
  Route: [cicd-pipeline](../../DevOps_and_Cloud/CI_CD/cicd-pipeline/SKILL.md)
  Reason: "CI/CD pipeline request."

State: User asks about [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md), k8s, pods, deployments, services, ingress.
  Route: [kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-patterns
  Reason: "[Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) orchestration request."

State: User asks about [GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Actions, CI/CD workflow, pipeline automation.
  Route: [github-actions](../../DevOps_and_Cloud/CI_CD/[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)-actions/SKILL.md)
  Reason: "[GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Actions CI/CD request."

State: User asks about [GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md), [ArgoCD](../../DevOps_and_Cloud/Containers_and_Orchestration/argocd/SKILL.md), Flux, Git-based deployment.
  Route: devops-[gitops](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md)
  Reason: "[GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md) deployment strategy request."

State: User asks about [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md), secrets management, HashiCorp [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md), secret storage.
  Route: devops-[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
  Reason: "[Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets management request."

State: User asks about AWS, EC2, S3, Lambda, RDS, cloud infrastructure.
  Route: devops-aws
  Reason: "AWS cloud infrastructure request."

State: User asks about [serverless](../../DevOps_and_Cloud/Containers_and_Orchestration/serverless/SKILL.md), Lambda, Cloud Functions, FaaS.
  Route: devops-[serverless](../../DevOps_and_Cloud/Containers_and_Orchestration/serverless/SKILL.md)
  Reason: "[Serverless](../../DevOps_and_Cloud/Containers_and_Orchestration/serverless/SKILL.md) architecture request."

State: User asks about [monorepo](../../Software_Engineering_and_Other/Frontend/monorepo/SKILL.md), Nx, Turborepo, workspace organization.
  Route: devops-[monorepo](../../Software_Engineering_and_Other/Frontend/monorepo/SKILL.md)
  Reason: "[Monorepo](../../Software_Engineering_and_Other/Frontend/monorepo/SKILL.md) tooling and workspace request."

State: User asks about Dependabot, Renovate, dependency updates, vulnerability scanning.
  Route: [dependency-management](../../Software_Engineering_and_Other/Miscellaneous/dependency-management/SKILL.md)
  Reason: "Dependency management automation request."

State: User asks about API documentation, Swagger, OpenAPI, API spec generation.
  Route: [api-documentation](../../Software_Engineering_and_Other/Backend/api-documentation/SKILL.md)
  Reason: "API documentation generation request."

State: User asks about [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md), tracing, [OpenTelemetry](../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md), distributed tracing, span.
  Route: devops-[observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)
  Reason: "[Observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) and distributed tracing request."

State: User asks about caching, Redis cache, CDN, cache strategy, cache invalidation.
  Route: [backend-caching](../../DevOps_and_Cloud/Observability_and_SecOps/caching/SKILL.md)
  Reason: "Caching strategy and implementation request."

State: User asks about API gateway, Kong, Nginx reverse proxy, AWS API Gateway, gateway pattern, BFF, API proxy, gateway aggregation.
  Route: [api-gateway](../../Software_Engineering_and_Other/Backend/api-gateway/SKILL.md)
  Reason: "API gateway configuration request."

State: User asks about rate limiting, throttling, API rate limit, backpressure.
  Route: rate-limiting
  Reason: "Rate limiting and throttling request."

State: User asks about load testing, k6, Locust, Artillery, benchmark, stress test.
  Route: [load-testing](../../DevOps_and_Cloud/Observability_and_SecOps/load-testing/SKILL.md)
  Reason: "Load testing and performance benchmarking request."

State: User asks about backend testing, unit tests, integration tests, TDD, mocking.
  Route: backend-testing
  Reason: "Backend testing strategy request."

State: User asks about accessibility, a11y, WCAG, screen reader, ARIA.
  Route: frontend-accessibility
  Reason: "Frontend accessibility request."

State: User asks about design system, component library, Storybook, tokens.
  Route: [frontend-design-system](../../Software_Engineering_and_Other/Backend/design-system/SKILL.md)
  Reason: "Design system and component library request."

State: User asks about frontend performance, Core Web Vitals, Lighthouse, LCP, CLS, INP.
  Route: frontend-performance
  Reason: "Frontend performance optimization request."

State: User asks about state management, Redux, Zustand, Pinia, NgRx, Vuex.
  Route: [frontend-state-management](../../Software_Engineering_and_Other/Frontend/state-management/SKILL.md)
  Reason: "Frontend state management request."

State: User asks about frontend testing, Jest, Vitest, Cypress, Playwright, testing library.
  Route: frontend-testing
  Reason: "Frontend testing strategy request."

State: User asks about Tailwind CSS, utility-first CSS, CSS design tokens.
  Route: tailwind-css
  Reason: "Tailwind CSS and utility-first styling request."

State: User asks about Storybook, component library, visual testing, component documentation.
  Route: [frontend-storybook](../../Software_Engineering_and_Other/Frontend/storybook/SKILL.md)
  Reason: "Storybook component documentation request."

State: User asks about PWA, service worker, offline support, manifest, progressive web app.
  Route: frontend-pwa
  Reason: "Progressive web app implementation request."

State: User asks about SEO, meta tags, Open Graph, structured data, sitemap, search optimization.
  Route: frontend-seo
  Reason: "SEO and search optimization request."

State: User asks about changelog, release notes, semantic versioning.
  Route: changelog-generator
  Reason: "Changelog generation request."

State: User asks about git workflow, branching strategy, rebase, merge, git flow.
  Route: [git-workflow](../../DevOps_and_Cloud/CI_CD/git-workflow/SKILL.md)
  Reason: "Git workflow and branching strategy request."

State: User asks about [profiling](../../Software_Engineering_and_Other/Frontend/profiling/SKILL.md), performance [audit](../../AI_and_Agents/Operations/audit/SKILL.md), bottleneck, flamegraph, CPU profile.
  Route: performance-profiler
  Reason: "Performance [profiling](../../Software_Engineering_and_Other/Frontend/profiling/SKILL.md) request."

State: User asks about README, documentation, project docs, contributing guide.
  Route: readme-writer
  Reason: "README and project documentation request."

State: User asks about refactoring, code improvement, restructuring, technical debt reduction.
  Route: refactor-guide
  Reason: "Code refactoring guide request."

State: User asks about security [audit](../../AI_and_Agents/Operations/audit/SKILL.md), dependency check, SAST, DAST, vulnerability scan.
  Route: security-auditor
  Reason: "Security [audit](../../AI_and_Agents/Operations/audit/SKILL.md) request."

State: User says iOS, Swift, SwiftUI, iPhone, iPad, Xcode.
  Route: mobile-ios
  Reason: "iOS native development request."

State: User says [Android](../../Mobile/android/SKILL.md), Kotlin, Jetpack Compose, Google Play.
  Route: mobile-[android](../../Mobile/android/SKILL.md)
  Reason: "[Android](../../Mobile/android/SKILL.md) native development request."

State: User says Flutter, Dart, cross-platform mobile, widgets, pubspec.
  Route: mobile-flutter
  Reason: "Flutter cross-platform development request."

State: User says React Native, Expo, RN, react-native, Hermes.
  Route: react-native
  Reason: "React Native cross-platform development request."

State: User asks about mobile pattern, mobile architecture, MVVM, MVI, mobile project structure, Clean Architecture mobile.
  Route: [mobile-patterns](../../Software_Engineering_and_Other/Patterns/patterns/SKILL.md)
  Reason: "Mobile architecture pattern request."

State: User asks about mobile testing, widget test, component test mobile, golden test, XCUITest, Espresso, Detox.
  Route: [mobile-testing](../../Software_Engineering_and_Other/Testing/testing/SKILL.md)
  Reason: "Mobile testing strategy request."

State: User asks about mobile performance, app slow, jank, frame drop, memory leak mobile, app startup.
  Route: mobile-performance
  Reason: "Mobile performance optimization request."

State: User asks about mobile security, secure storage, certificate pinning, OWASP mobile, root detection, biometric.
  Route: [mobile-security](../../Security/security/SKILL.md)
  Reason: "Mobile security implementation request."

State: User asks about mobile networking, API client mobile, offline first, GraphQL mobile, REST client, caching mobile, pagination.
  Route: [mobile-networking](../../DevOps_and_Cloud/Observability_and_SecOps/networking/SKILL.md)
  Reason: "Mobile networking layer request."

State: User asks about mobile storage, local database, SQLite mobile, Room, Core Data, Hive, Isar, file storage mobile.
  Route: mobile-storage
  Reason: "Mobile local storage request."

State: User asks about mobile deploy, TestFlight, App Store, Play Store, mobile CI/CD, code signing.
  Route: [mobile-deployment](../../DevOps_and_Cloud/CI_CD/deployment/SKILL.md)
  Reason: "Mobile app deployment request."

State: User asks about push notifications, APNs, FCM, notification payload.
  Route: push-notifications
  Reason: "Mobile push notification implementation request."

State: User asks about in-app purchase, subscription, StoreKit, Play Billing, revenue.
  Route: in-app-purchase
  Reason: "In-app purchase and subscription request."

State: User asks about crash reporting, [Sentry](../../DevOps_and_Cloud/Observability_and_SecOps/sentry/SKILL.md), Crashlytics, error tracking mobile.
  Route: crash-reporting
  Reason: "Mobile crash reporting setup request."

State: User asks about user stories, story splitting, story points, backlog refinement.
  Route: [create-story](../create-story/SKILL.md)
  Reason: "User story creation request."

State: User says init, scaffold, new project, start fresh, project setup.
  Route: [project-init](../../Software_Engineering_and_Other/Miscellaneous/project-init/SKILL.md)
  Reason: "Project initialization request."

State: User asks about GraphQL, Apollo, schema design, resolver patterns.
  Route: [backend-graphql-patterns](../../Software_Engineering_and_Other/Patterns/graphql-patterns/SKILL.md)
  Reason: "GraphQL request."

State: User asks about background jobs, task queues, workers, scheduled tasks.
  Route: [backend-background-jobs](../../Software_Engineering_and_Other/Patterns/background-jobs/SKILL.md)
  Reason: "Background job request."

State: User asks about search, Elasticsearch, Meilisearch, search indexing.
  Route: [backend-search-patterns](../../Software_Engineering_and_Other/Patterns/search-patterns/SKILL.md)
  Reason: "Search request."

State: User asks about data streaming, Kafka, stream processing, event streaming.
  Route: backend-[data-streaming](../../Data_Engineering/streaming/SKILL.md)
  Reason: "Data streaming request."

State: User asks about file storage, object storage, S3, file upload.
  Route: [backend-file-storage](../../DevOps_and_Cloud/Cloud_Providers/file-storage/SKILL.md)
  Reason: "File storage request."

State: User asks about feature flags, feature toggles, canary release, gradual rollout.
  Route: backend-[feature-flags](../../DevOps_and_Cloud/CI_CD/feature-flags/SKILL.md)
  Reason: "Feature flag request."

State: User asks about i18n, internationalization, localization, translations.
  Route: backend-internationalization
  Reason: "Internationalization request."

State: User asks about logging, structured logging, JSON logging, log shipping.
  Route: [backend-structured-logging](../../DevOps_and_Cloud/Observability_and_SecOps/structured-logging/SKILL.md)
  Reason: "Structured logging request."

State: User asks about [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md), tracing, [OpenTelemetry](../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md), distributed tracing.
  Route: backend-[observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)
  Reason: "[Observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) request."

State: User asks about resilience, circuit breaker, retry, bulkhead, rate limiting.
  Route: [backend-resilience-patterns](../../DevOps_and_Cloud/Containers_and_Orchestration/resilience-patterns/SKILL.md)
  Reason: "Resilience patterns request."

State: User asks about OpenAPI, Swagger, API specification.
  Route: [backend-openapi-documentation](../../Software_Engineering_and_Other/Backend/openapi-documentation/SKILL.md)
  Reason: "OpenAPI documentation request."

State: User asks about contract testing, Pact, consumer-driven contracts.
  Route: backend-contract-testing
  Reason: "Contract testing request."

State: User asks about idempotency, idempotent API, duplicate detection.
  Route: [backend-idempotency](../../Software_Engineering_and_Other/Backend/idempotency/SKILL.md)
  Reason: "Idempotency request."

State: User asks about distributed lock, Redlock, distributed mutex, lease.
  Route: [backend-distributed-locking](../../Software_Engineering_and_Other/Patterns/distributed-locking/SKILL.md)
  Reason: "Distributed locking request."

State: User asks about webhook, webhook delivery, outgoing webhook.
  Route: [backend-webhooks](../../Software_Engineering_and_Other/Backend/webhooks/SKILL.md)
  Reason: "Webhook request."

State: User asks about API versioning, version strategy, versioning header.
  Route: [backend-api-versioning](../../Software_Engineering_and_Other/Backend/api-versioning/SKILL.md)
  Reason: "API versioning request."

State: User asks about scheduled tasks, cron jobs, Quartz, job scheduling.
  Route: [backend-scheduling-cron](../../Software_Engineering_and_Other/Patterns/scheduling-cron/SKILL.md)
  Reason: "Scheduling/cron request."

State: User asks about [multi-tenancy](../../DevOps_and_Cloud/Containers_and_Orchestration/multi-tenancy/SKILL.md), multi-tenant architecture, tenant isolation backend.
  Route: backend-[multi-tenancy](../../DevOps_and_Cloud/Containers_and_Orchestration/multi-tenancy/SKILL.md)
  Reason: "[Multi-tenancy](../../DevOps_and_Cloud/Containers_and_Orchestration/multi-tenancy/SKILL.md) request."

State: User asks about BFF, Backend for Frontend, BFF pattern.
  Route: [backend-bff-pattern](../../Software_Engineering_and_Other/Backend/bff-pattern/SKILL.md)
  Reason: "BFF pattern request."

State: User asks about data masking, data redaction, PII masking.
  Route: [backend-data-masking](../../Data_Engineering/data-masking/SKILL.md)
  Reason: "Data masking request."

State: User asks about [audit](../../AI_and_Agents/Operations/audit/SKILL.md) log, [audit](../../AI_and_Agents/Operations/audit/SKILL.md) trail, [audit](../../AI_and_Agents/Operations/audit/SKILL.md) logging.
  Route: backend-[audit-logging](../../DevOps_and_Cloud/Observability_and_SecOps/[audit](../../AI_and_Agents/Operations/audit/SKILL.md)-logging/SKILL.md)
  Reason: "[Audit](../../AI_and_Agents/Operations/audit/SKILL.md) logging request."

State: User asks about plugin architecture, plugin system, extension point.
  Route: [backend-plugin-architecture](../../Software_Engineering_and_Other/Patterns/plugin-architecture/SKILL.md)
  Reason: "Plugin architecture request."

State: User asks about CQRS, command query segregation, read model, write model, command handler, query handler, materialized view.
  Route: [backend-cqrs-patterns](../../Software_Engineering_and_Other/Patterns/cqrs-patterns/SKILL.md)
  Reason: "CQRS patterns request."

State: User asks about event sourcing, event store, event stream, rehydrate, event replay, projection rebuild, append-only log.
  Route: backend-event-sourcing
  Reason: "Event sourcing request."

State: User asks about saga, distributed transaction, choreography saga, orchestration saga, compensating transaction, saga state machine, long running transaction.
  Route: backend-saga-patterns
  Reason: "Saga patterns request."

State: User asks about transactional outbox, outbox pattern, reliable event publishing, dual write, CDC outbox, message relay, outbox table.
  Route: [backend-transactional-outbox](../../Software_Engineering_and_Other/Patterns/transactional-outbox/SKILL.md)
  Reason: "Transactional outbox request."

State: User asks about Remix, Remix routing, Remix loaders/actions.
  Route: frontend-remix-architecture or frontend-remix-patterns
  Reason: "Remix stack request."

State: User asks about Astro, Astro islands, content collections.
  Route: frontend-astro-architecture
  Reason: "Astro stack request."

State: User asks about Astro patterns, Astro integrations, Astro content.
  Route: frontend-astro-patterns
  Reason: "Astro patterns request."

State: User asks about Qwik patterns, Qwik City, Qwik components.
  Route: frontend-qwik-patterns
  Reason: "Qwik patterns request."

State: User asks about Vue patterns, Vue composables, Vue composition API.
  Route: vue-patterns
  Reason: "Vue patterns request."

State: User asks about Lit, LitElement, LitHtml, lit-html.
  Route: [frontend-lit](../../Software_Engineering_and_Other/Frontend/lit/SKILL.md)
  Reason: "Lit request."

State: User asks about web components, custom elements, shadow DOM, HTML templates.
  Route: [frontend-web-components](../../Software_Engineering_and_Other/Frontend/web-components/SKILL.md)
  Reason: "Web components request."

State: User asks about AR/VR, augmented reality, virtual reality, WebXR.
  Route: [mobile-ar-vr](../../Mobile/ar-vr/SKILL.md)
  Reason: "AR/VR request."

State: User asks about [Nomad](../../DevOps_and_Cloud/Containers_and_Orchestration/nomad/SKILL.md), HashiCorp [Nomad](../../DevOps_and_Cloud/Containers_and_Orchestration/nomad/SKILL.md), job scheduling.
  Route: devops-[nomad](../../DevOps_and_Cloud/Containers_and_Orchestration/nomad/SKILL.md)
  Reason: "[Nomad](../../DevOps_and_Cloud/Containers_and_Orchestration/nomad/SKILL.md) request."

State: User asks about [incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) response, on-call, PagerDuty, [incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) management.
  Route: devops-[incident-response](../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md)
  Reason: "[Incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) response request."

State: User asks about cost-benefit, ROI, TCO, cost analysis.
  Route: management-cost-benefit
  Reason: "Cost-benefit analysis request."

State: User asks about hiring, interview, recruitment, technical screen.
  Route: [management-hiring](../hiring/SKILL.md)
  Reason: "Hiring request."

State: User asks about stakeholder, stakeholder communication, steerco, status update.
  Route: [management-stakeholder](../stakeholder/SKILL.md)
  Reason: "Stakeholder communication request."

### ML Skills

State: User asks about experiment tracking, MLflow, experiment management.
  Route: ml-[experiment-tracking](../../Data_Engineering/experiment-tracking/SKILL.md)
  Reason: "Experiment tracking request."

State: User asks about classical ML, scikit-learn, sklearn, regression, classification, clustering.
  Route: [ml-classical-ml](../../AI_and_Agents/Models_and_FineTuning/classical-ml/SKILL.md)
  Reason: "Classical ML request."

State: User asks about deep learning, PyTorch, TensorFlow, neural networks, CNN, RNN, transformer.
  Route: [ml-deep-learning](../../AI_and_Agents/Architecture/deep-learning/SKILL.md)
  Reason: "Deep learning request."

State: User asks about feature engineering, feature creation, feature selection, feature transformation.
  Route: [ml-feature-engineering](../../Data_Engineering/feature-engineering/SKILL.md)
  Reason: "Feature engineering request."

State: User asks about hyperparameter tuning, Optuna, grid search, Bayesian optimization.
  Route: [ml-hyperparameter-tuning](../../AI_and_Agents/Models_and_FineTuning/hyperparameter-tuning/SKILL.md)
  Reason: "Hyperparameter tuning request."

State: User asks about model evaluation, confusion matrix, ROC AUC, precision recall, cross-validation.
  Route: [ml-model-evaluation](../../AI_and_Agents/Models_and_FineTuning/model-evaluation/SKILL.md)
  Reason: "Model evaluation request."

State: User asks about model interpretability, SHAP, LIME, explainable AI, feature importance.
  Route: [ml-model-interpretability](../../AI_and_Agents/Models_and_FineTuning/model-interpretability/SKILL.md)
  Reason: "Model interpretability request."

State: User asks about time series, Prophet, forecasting, seasonality, trend analysis.
  Route: [ml-time-series](../../AI_and_Agents/Models_and_FineTuning/time-series/SKILL.md)
  Reason: "Time series request."

State: User asks about NLP, HuggingFace, transformers, text classification, NER, sentiment analysis.
  Route: [ml-nlp](../../AI_and_Agents/Models_and_FineTuning/nlp/SKILL.md)
  Reason: "NLP request."

State: User asks about computer vision, YOLO, object detection, image classification, segmentation.
  Route: [ml-computer-vision](../../AI_and_Agents/Models_and_FineTuning/computer-vision/SKILL.md)
  Reason: "Computer vision request."

State: User asks about recommender system, collaborative filtering, matrix factorization, content-based filtering.
  Route: ml-recommender
  Reason: "Recommender system request."

State: User asks about anomaly detection, outlier detection, fraud detection, novelty detection.
  Route: [ml-anomaly-detection](../../AI_and_Agents/Models_and_FineTuning/anomaly-detection/SKILL.md)
  Reason: "Anomaly detection request."

State: User asks about ML pipeline, Kubeflow, ML workflow, model training pipeline.
  Route: ml-[ml-pipeline](../../AI_and_Agents/Workflows/ml-pipeline/SKILL.md)
  Reason: "ML pipeline request."

State: User asks about feature store, Feast, feature serving, feature registry.
  Route: [ml-feature-store](../../Software_Engineering_and_Other/Miscellaneous/feature-store/SKILL.md)
  Reason: "Feature store request."

State: User asks about model serving, BentoML, Triton, model deployment, model inference.
  Route: [ml-model-serving](../../AI_and_Agents/Models_and_FineTuning/model-serving/SKILL.md)
  Reason: "Model serving request."

State: User asks about math foundations, linear algebra, calculus, statistics for ML.
  Route: [ml-math-foundations](../../Software_Engineering_and_Other/Miscellaneous/math-foundations/SKILL.md)
  Reason: "Math foundations for ML request."

### New AI Skills

State: User asks about model training, fine-tuning, LoRA, QLoRA, training loop, distributed training.
  Route: ai-model-training
  Reason: "Model training request."

State: User asks about embeddings, sentence-transformers, text embedding, vector embedding.
  Route: ai-embeddings
  Reason: "Embeddings request."

State: User asks about multimodal, CLIP, LLaVA, image-text, vision-language model.
  Route: ai-multimodal
  Reason: "Multimodal AI request."

State: User asks about AI safety, guardrails, content moderation, responsible AI, model alignment.
  Route: ai-ai-safety
  Reason: "AI safety request."

State: User asks about AI testing, LLM testing, eval harness, model evaluation.
  Route: ai-ai-testing
  Reason: "AI testing request."

State: User asks about AI cost optimization, token efficiency, model quantization, inference cost.
  Route: ai-ai-[cost-optimization](../../DevOps_and_Cloud/Cloud_Providers/cost-optimization/SKILL.md)
  Reason: "AI cost optimization request."

State: User asks about LangChain, LlamaIndex, LangGraph, chain, agent framework.
  Route: ai-langchain-patterns
  Reason: "LangChain patterns request."

State: User asks about MCP, Model Context Protocol, context server, tool integration.
  Route: ai-mcp-patterns
  Reason: "MCP patterns request."

State: User asks about AI [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md), LangSmith, Weights & Biases, tracing LLM, prompt [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md).
  Route: ai-ai-[observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)
  Reason: "AI [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) request."

### New Data Skills

State: User asks about distributed storage, HDFS, distributed file system, object storage.
  Route: [data-distributed-storage](../../DevOps_and_Cloud/Cloud_Providers/distributed-storage/SKILL.md)
  Reason: "Distributed storage request."

State: User asks about distributed compute, Spark, Dask, distributed processing, cluster computing.
  Route: [data-distributed-compute](../../Data_Engineering/distributed-compute/SKILL.md)
  Reason: "Distributed compute request."

State: User asks about data lake, Delta Lake, data lake architecture, lake storage.
  Route: [data-data-lake](../../Software_Engineering_and_Other/Databases/data-lake/SKILL.md)
  Reason: "Data lake request."

State: User asks about data lakehouse, lakehouse architecture, medallion architecture, Delta Lake.
  Route: [data-data-lakehouse](../../Data_Engineering/data-lakehouse/SKILL.md)
  Reason: "Data lakehouse request."

State: User asks about batch processing, Hive, batch ETL, nightly jobs, batch pipeline.
  Route: [data-batch-processing](../../DevOps_and_Cloud/CI_CD/batch-processing/SKILL.md)
  Reason: "Batch processing request."

State: User asks about workflow orchestration, Airflow, Prefect, Dagster, pipeline orchestration.
  Route: data-workflow-orchestration
  Reason: "Workflow orchestration request."

State: User asks about CDC, change data capture, Debezium, streaming replication.
  Route: data-cdc-patterns
  Reason: "CDC patterns request."

State: User asks about data replication, database replication, cross-region replication.
  Route: data-data-replication
  Reason: "Data replication request."

State: User asks about data platform, data engineering platform, platform engineering data.
  Route: [data-data-platform](../../Data_Engineering/data-platform/SKILL.md)
  Reason: "Data platform request."

State: User asks about data catalog, DataHub, Amundsen, data discovery, metadata management.
  Route: [data-data-catalog](../../Data_Engineering/data-catalog/SKILL.md)
  Reason: "Data catalog request."

State: User asks about data [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md), Monte Carlo, Sifflet, data [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), data downtime.
  Route: [data-data-observability](../../Data_Engineering/data-[observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)/SKILL.md)
  Reason: "Data [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) request."

State: User asks about data contracts, contract-driven data, schema contract, data agreement.
  Route: [data-data-contracts](../../Data_Engineering/data-contracts/SKILL.md)
  Reason: "Data contracts request."

State: User asks about data clean room, clean room, privacy-preserving data.
  Route: [data-clean-room](../../Data_Engineering/data-clean-room/SKILL.md)
  Reason: "Data clean room request."

State: User asks about data cost optimization, data storage cost, query cost.
  Route: [data-cost-optimization](../../DevOps_and_Cloud/Cloud_Providers/data-[cost-optimization](../../DevOps_and_Cloud/Cloud_Providers/cost-optimization/SKILL.md)/SKILL.md)
  Reason: "Data cost optimization request."

State: User asks about data formats, Parquet, Avro, ORC, file format.
  Route: [data-formats](../../Data_Engineering/data-formats/SKILL.md)
  Reason: "Data formats request."

State: User asks about data lineage, column lineage, dataset lineage.
  Route: [data-lineage](../../Data_Engineering/data-lineage/SKILL.md)
  Reason: "Data lineage request."

State: User asks about data pipeline CI/CD, data testing in CI, dbt test, data pipeline test.
  Route: [data-pipeline-cicd](../../DevOps_and_Cloud/CI_CD/data-pipeline-cicd/SKILL.md)
  Reason: "Data pipeline CI/CD request."

State: User asks about data testing, data quality test, data diff, data validation test.
  Route: [data-testing](../../Data_Engineering/data-testing/SKILL.md)
  Reason: "Data testing request."

State: User asks about reverse ETL, reverse ETL pipeline, warehouse to SaaS.
  Route: [data-reverse-etl](../../Data_Engineering/reverse-etl/SKILL.md)
  Reason: "Reverse ETL request."

State: User asks about data mesh, data product, domain-driven data, decentralized data.
  Route: [data-data-mesh](../../Data_Engineering/data-mesh/SKILL.md)
  Reason: "Data mesh request."

State: User asks about data versioning, DVC, data version control, dataset versioning.
  Route: [data-data-versioning](../../Data_Engineering/data-versioning/SKILL.md)
  Reason: "Data versioning request."

State: User asks about data API, Hasura, data access API, GraphQL data API.
  Route: [data-data-api](../../Software_Engineering_and_Other/Backend/data-api/SKILL.md)
  Reason: "Data API request."

State: User asks about data virtualization, Trino, Presto, federated query, data federation.
  Route: [data-data-virtualization](../../Data_Engineering/data-virtualization/SKILL.md)
  Reason: "Data virtualization request."

State: User asks about schema registry, Avro, schema evolution, schema compatibility.
  Route: [data-schema-registry](../../Data_Engineering/schema-registry/SKILL.md)
  Reason: "Schema registry request."

State: User asks about relational database, [PostgreSQL](../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md), [MySQL](../../Software_Engineering_and_Other/Backend/mysql/SKILL.md), SQL Server, database design.
  Route: [data-relational-database](../../Software_Engineering_and_Other/Databases/relational-database/SKILL.md)
  Reason: "Relational database request."

State: User asks about NoSQL, [MongoDB](../../Software_Engineering_and_Other/Backend/mongodb/SKILL.md), Cassandra, DynamoDB, document database.
  Route: [data-nosql-database](../../Software_Engineering_and_Other/Databases/nosql-database/SKILL.md)
  Reason: "NoSQL database request."

State: User asks about graph database, Neo4j, graph DB, Cypher, knowledge graph.
  Route: [data-graph-database](../../Software_Engineering_and_Other/Databases/graph-database/SKILL.md)
  Reason: "Graph database request."

State: User asks about search engine, Elasticsearch, Solr, full-text search, search index.
  Route: [data-search-engine](../../Software_Engineering_and_Other/Databases/search-engine/SKILL.md)
  Reason: "Search engine request."

### New DevOps Skills

State: User asks about DataOps, data operations, data pipeline ops, data reliability.
  Route: [devops-dataops](../../Data_Engineering/dataops/SKILL.md)
  Reason: "DataOps request."

State: User asks about MLOps, ML operations, model deployment pipeline, model [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md).
  Route: [devops-mlops](../../AI_and_Agents/Models_and_FineTuning/mlops/SKILL.md)
  Reason: "MLOps request."

State: User asks about [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) for data, K8s data workloads, Spark on K8s, data on [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).
  Route: [kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-for-data
  Reason: "[Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) for data request."

State: User asks about cloud cost optimization, cloud spend, cost reduction, cloud billing.
  Route: [cloud-cost-optimization](../../DevOps_and_Cloud/Cloud_Providers/cloud-[cost-optimization](../../DevOps_and_Cloud/Cloud_Providers/cost-optimization/SKILL.md)/SKILL.md)
  Reason: "Cloud cost optimization request."

State: User asks about cloud architecture, landing zone, well-architected framework, cloud foundation, [multi-cloud](../../DevOps_and_Cloud/Cloud_Providers/multi-cloud/SKILL.md), cloud governance.
  Route: [cloud-architecture](../../DevOps_and_Cloud/Cloud_Providers/cloud-architecture/SKILL.md)
  Reason: "Cloud architecture request."

State: User asks about platform engineering, internal developer platform, IDP, Backstage, developer portal, golden path, platform team.
  Route: devops-[platform-engineering](../../Software_Engineering_and_Other/Frontend/platform-engineering/SKILL.md)
  Reason: "Platform engineering request."

State: User asks about SRE, site reliability engineering, SLI, SLO, error budget, toil reduction, reliability engineering, production readiness.
  Route: [devops-sre-practices](../../Software_Engineering_and_Other/Miscellaneous/sre-practices/SKILL.md)
  Reason: "SRE practices request."

State: User asks about internal developer platform deep dive, Backstage plugins, software templates, golden path architecture, platform APIs, platform adoption.
  Route: devops-[internal-developer-platform](../internal-developer-platform/SKILL.md)
  Reason: "Internal developer platform request."

State: User asks about [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) operator, custom controller, CRD, Kubebuilder, operator pattern, reconciliation loop.
  Route: [devops-[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-operators](../../DevOps_and_Cloud/Containers_and_Orchestration/[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-operators/SKILL.md)
  Reason: "[Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) operators request."

State: User asks about advanced [GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md), multi-cluster [GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md), ApplicationSet, [ArgoCD](../../DevOps_and_Cloud/Containers_and_Orchestration/argocd/SKILL.md) sync waves, cluster bootstrapping, [GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md) at scale.
  Route: [devops-[gitops](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md)-advanced](../../DevOps_and_Cloud/Containers_and_Orchestration/[gitops](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md)-advanced/SKILL.md)
  Reason: "Advanced [GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md) request."

State: User asks about progressive delivery, canary deployment, blue-green, traffic shifting, Flagger, Argo Rollouts, gradual rollout, deploy strategy.
  Route: devops-[progressive-delivery](../../DevOps_and_Cloud/CI_CD/progressive-delivery/SKILL.md)
  Reason: "Progressive delivery request."

State: User asks about policy as code, OPA, Rego, Kyverno, admission controller, policy enforcement, guardrails, policy testing.
  Route: devops-[policy-as-code](../../Security/policy-as-code/SKILL.md)
  Reason: "Policy as code request."

State: User asks about cloud migration, lift-and-shift, rehost, replatform, refactor, 6 Rs migration, legacy to cloud, data center migration.
  Route: devops-[cloud-migration](../../DevOps_and_Cloud/Cloud_Providers/cloud-migration/SKILL.md)
  Reason: "Cloud migration request."

State: User asks about [Pulumi](../../DevOps_and_Cloud/Infrastructure_as_Code/pulumi/SKILL.md), infrastructure as code with programming languages, [Pulumi](../../DevOps_and_Cloud/Infrastructure_as_Code/pulumi/SKILL.md) stack, [Pulumi](../../DevOps_and_Cloud/Infrastructure_as_Code/pulumi/SKILL.md) state.
  Route: devops-[pulumi](../../DevOps_and_Cloud/Infrastructure_as_Code/pulumi/SKILL.md)
  Reason: "[Pulumi](../../DevOps_and_Cloud/Infrastructure_as_Code/pulumi/SKILL.md) IaC request."

State: User asks about Crossplane, Crossplane composition, managed resource, provider, control plane, Crossplane function.
  Route: devops-crossplane
  Reason: "Crossplane control plane request."

State: User asks about GitLab CI, GitLab pipeline, GitLab Runner, GitLab CI/CD.
  Route: devops-[gitlab-ci](../../DevOps_and_Cloud/CI_CD/gitlab-ci/SKILL.md)
  Reason: "GitLab CI/CD request."

State: User asks about [CircleCI](../../DevOps_and_Cloud/CI_CD/circleci/SKILL.md), [CircleCI](../../DevOps_and_Cloud/CI_CD/circleci/SKILL.md) config, [CircleCI](../../DevOps_and_Cloud/CI_CD/circleci/SKILL.md) orb, [CircleCI](../../DevOps_and_Cloud/CI_CD/circleci/SKILL.md) pipeline.
  Route: devops-[circleci](../../DevOps_and_Cloud/CI_CD/circleci/SKILL.md)
  Reason: "[CircleCI](../../DevOps_and_Cloud/CI_CD/circleci/SKILL.md) request."

State: User asks about [autoscaling](../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md), HPA, VPA, Keda, Cluster Autoscaler, pod [autoscaling](../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md), node [autoscaling](../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md), [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) scaling.
  Route: [devops-[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-autoscaling](../../DevOps_and_Cloud/Containers_and_Orchestration/[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-[autoscaling](../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md)/SKILL.md)
  Reason: "[Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) [autoscaling](../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md) request."

State: User asks about APM, [Datadog](../../DevOps_and_Cloud/Observability_and_SecOps/datadog/SKILL.md), New Relic, application [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), APM instrumentation, synthetic [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) platform.
  Route: devops-[apm-observability](../../AI_and_Agents/Operations/apm-[observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)/SKILL.md)
  Reason: "APM and [observability](../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) platform request."

State: User asks about Cilium, eBPF, Cilium network policy, Hubble, Cilium cluster mesh, cloud-native networking.
  Route: devops-[cilium-ebpf](../../DevOps_and_Cloud/Containers_and_Orchestration/cilium-ebpf/SKILL.md)
  Reason: "Cilium/eBPF networking request."

State: User asks about [OpenTelemetry](../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md), OTel collector, distributed tracing, [OpenTelemetry](../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md) instrumentation, trace sampling.
  Route: devops-[opentelemetry](../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md)
  Reason: "[OpenTelemetry](../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md) request."

State: User asks about Oracle Cloud, OCI, OKE, Oracle [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) Engine, Oracle database cloud.
  Route: devops-[oracle-cloud](../../DevOps_and_Cloud/Cloud_Providers/oracle-cloud/SKILL.md)
  Reason: "Oracle Cloud request."

State: User asks about [DigitalOcean](../../DevOps_and_Cloud/Cloud_Providers/digitalocean/SKILL.md), DOKS, [DigitalOcean](../../DevOps_and_Cloud/Cloud_Providers/digitalocean/SKILL.md) App Platform, Droplet, [DigitalOcean](../../DevOps_and_Cloud/Cloud_Providers/digitalocean/SKILL.md) [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).
  Route: devops-[digitalocean](../../DevOps_and_Cloud/Cloud_Providers/digitalocean/SKILL.md)
  Reason: "[DigitalOcean](../../DevOps_and_Cloud/Cloud_Providers/digitalocean/SKILL.md) request."

State: User asks about IBM Cloud, IBM [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) Service, IBM Cloud Foundry, IBM Cloud VPC.
  Route: devops-[ibm-cloud](../../DevOps_and_Cloud/Cloud_Providers/ibm-cloud/SKILL.md)
  Reason: "IBM Cloud request."

State: User asks about Alibaba Cloud, Aliyun, ACK, Alibaba Cloud ECS, ApsaraDB.
  Route: devops-[alibaba-cloud](../../DevOps_and_Cloud/Cloud_Providers/alibaba-cloud/SKILL.md)
  Reason: "Alibaba Cloud request."

State: User asks about Hetzner, Hetzner Cloud, Hetzner dedicated server, Hetzner [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).
  Route: devops-hetzner
  Reason: "Hetzner request."

### New Security Skills

State: User asks about data security, data protection, encryption at rest, data masking, data classification.
  Route: [security-data-security](../../Security/data-security/SKILL.md)
  Reason: "Data security request."

State: User asks about Zero Trust, zero trust architecture, ZTA, BeyondCorp, never trust always verify, identity-aware proxy, microsegmentation.
  Route: [zero-trust](../../Security/zero-trust/SKILL.md)
  Reason: "Zero Trust architecture request."

State: User asks about CSPM, cloud security posture management, Wiz, Prisma Cloud, cloud compliance, cloud misconfiguration, CIEM.
  Route: cspm
  Reason: "CSPM request."

State: User asks about penetration testing, pentest, ethical hacking, vulnerability assessment, security testing, web app pentest, network pentest, cloud pentest.
  Route: [penetration-testing](../../Security/penetration-testing/SKILL.md)
  Reason: "Penetration testing request."

State: User asks about IAM governance, identity governance, access certification, privileged access management, identity lifecycle, join/move/leave, access review.
  Route: iam-governance
  Reason: "IAM governance request."

State: User asks about SOC operations, SOC tier, SOC structure, SOC [runbook](../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md), security operations center, SOC shift.
  Route: [soc-operations](../../Security/soc-operations/SKILL.md)
  Reason: "SOC operations request."

State: User asks about SIEM, correlation rule, detection rule, log ingestion, SIEM architecture, Splunk, Elastic SIEM, Wazuh, Sentinel.
  Route: [siem-engineering](../../Security/siem-engineering/SKILL.md)
  Reason: "SIEM engineering request."

State: User asks about SOAR, playbook automation, security automation, SOAR playbook, [incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) automation.
  Route: soar-automation
  Reason: "SOAR automation request."

State: User asks about threat intelligence, CTI, threat feed, IoC, TTP, threat actor, MITRE ATT&CK, OSINT, threat intel lifecycle.
  Route: [threat-intelligence](../../Security/threat-intelligence/SKILL.md)
  Reason: "Threat intelligence request."

State: User asks about EDR, XDR, endpoint detection, endpoint response, CrowdStrike, Defender, SentinelOne, endpoint security.
  Route: [edr-xdr](../../Security/edr-xdr/SKILL.md)
  Reason: "EDR/XDR request."

State: User asks about authentication, authorization, JWT, OAuth, SSO, RBAC.
  Route: [backend-auth-patterns](../../Security/auth-patterns/SKILL.md)
  Reason: "Authentication and authorization patterns request."

State: User asks about clean architecture, hexagonal, onion, ports and adapters, dependency rule.
  Route: [backend-clean-architecture](../../Software_Engineering_and_Other/Patterns/clean-architecture/SKILL.md)
  Reason: "Clean architecture patterns request."

State: User asks about database design, SQL, migrations, ORM, schema design, indexing.
  Route: [backend-database-patterns](../../Software_Engineering_and_Other/Databases/database-patterns/SKILL.md)
  Reason: "Database design patterns request."

State: User asks about event-driven, messaging, Kafka, RabbitMQ, pub-sub, event bus.
  Route: [backend-event-driven](../../Software_Engineering_and_Other/Patterns/event-driven/SKILL.md)
  Reason: "Event-driven architecture request."

State: User asks about gRPC, protobuf, streaming, bidirectional RPC.
  Route: grpc-patterns
  Reason: "gRPC and protobuf patterns request."

State: User asks about WebSocket, real-time, socket.io, WS, live updates.
  Route: websocket-patterns
  Reason: "WebSocket and real-time communication request."

State: User asks about message queue, message broker, RabbitMQ, Kafka, SQS.
  Route: message-queue
  Reason: "Message queue and broker patterns request."

State: User asks about SolidJS, Solid signals, SolidJS reactivity.
  Route: frontend-solidjs-architecture or frontend-solidjs-patterns
  Reason: "SolidJS stack request."

State: User asks about Qwik, Qwik resumable, Qwik City.
  Route: frontend-qwik-architecture
  Reason: "Qwik stack request."

State: User asks about Svelte core, Svelte runes, Svelte 5.
  Route: frontend-svelte-architecture or frontend-svelte-patterns
  Reason: "Svelte core request."

State: User asks about animation, motion, Framer Motion, GSAP.
  Route: [frontend-animation](../../Software_Engineering_and_Other/Backend/animation/SKILL.md)
  Reason: "Animation request."

State: User asks about forms, form validation, React Hook Form.
  Route: [frontend-form-handling](../../Software_Engineering_and_Other/Backend/form-handling/SKILL.md)
  Reason: "Form handling request."

State: User asks about data fetching, TanStack Query, SWR, server state.
  Route: [frontend-data-fetching](../../Software_Engineering_and_Other/Backend/data-fetching/SKILL.md)
  Reason: "Data fetching request."

State: User asks about bundler, Vite, Webpack, build tools.
  Route: [frontend-bundler-tools](../../DevOps_and_Cloud/CI_CD/bundler-tools/SKILL.md)
  Reason: "Bundler/tools request."

State: User asks about image optimization, responsive images, image CDN.
  Route: frontend-[image-optimization](../../Software_Engineering_and_Other/Frontend/image-optimization/SKILL.md)
  Reason: "Image optimization request."

State: User asks about theming, dark mode, design tokens.
  Route: [frontend-theming](../../Software_Engineering_and_Other/Frontend/theming/SKILL.md)
  Reason: "Theming request."

State: User asks about Kotlin Multiplatform, KMP, Compose Multiplatform.
  Route: [mobile-kotlin-multiplatform](../../Software_Engineering_and_Other/Languages/kotlin-multiplatform/SKILL.md)
  Reason: "KMP request."

State: User asks about Ionic, Capacitor, hybrid mobile.
  Route: [mobile-ionic-capacitor](../../Software_Engineering_and_Other/Frontend/ionic-capacitor/SKILL.md)
  Reason: "Ionic/Capacitor request."

State: User asks about .NET MAUI, MAUI app, Xamarin.
  Route: [mobile-dotnet-maui](../../Software_Engineering_and_Other/Frontend/dotnet-maui/SKILL.md)
  Reason: ".NET MAUI request."

State: User asks about deep linking, universal links, app links.
  Route: [mobile-deep-linking](../../Mobile/deep-linking/SKILL.md)
  Reason: "Deep linking request."

State: User asks about offline-first, offline sync, connectivity.
  Route: [mobile-offline-first](../../Software_Engineering_and_Other/Miscellaneous/offline-first/SKILL.md)
  Reason: "Offline-first request."

State: User asks about biometrics, Face ID, fingerprint, local auth.
  Route: [mobile-biometrics](../../Security/biometrics/SKILL.md)
  Reason: "Biometrics request."

State: User asks about maps, location, GPS, map integration.
  Route: mobile-map-location
  Reason: "Map/location request."

State: User asks about camera, photo, video, media capture.
  Route: [mobile-camera-media](../../Software_Engineering_and_Other/Miscellaneous/camera-media/SKILL.md)
  Reason: "Camera/media request."

State: User asks about analytics, event tracking, [Firebase](../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) Analytics, telemetry.
  Route: mobile-analytics
  Reason: "Analytics request."

State: User asks about [ArgoCD](../../DevOps_and_Cloud/Containers_and_Orchestration/argocd/SKILL.md), [GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md), [ArgoCD](../../DevOps_and_Cloud/Containers_and_Orchestration/argocd/SKILL.md) sync.
  Route: devops-[argo-cd](../../DevOps_and_Cloud/Containers_and_Orchestration/argo-cd/SKILL.md)
  Reason: "[ArgoCD](../../DevOps_and_Cloud/Containers_and_Orchestration/argocd/SKILL.md)/[GitOps](../../DevOps_and_Cloud/Containers_and_Orchestration/gitops/SKILL.md) request."

State: User asks about Azure, Microsoft Azure, AKS.
  Route: [devops-azure](../../DevOps_and_Cloud/Cloud_Providers/azure/SKILL.md)
  Reason: "Azure request."

State: User asks about GCP, Google Cloud, GKE.
  Route: [devops-gcp](../../DevOps_and_Cloud/Cloud_Providers/gcp/SKILL.md)
  Reason: "GCP request."

State: User asks about chaos engineering, resilience testing, fault injection.
  Route: devops-[chaos-engineering](../../DevOps_and_Cloud/Observability_and_SecOps/chaos-engineering/SKILL.md)
  Reason: "Chaos engineering request."

State: User asks about service mesh, Istio, Linkerd, mTLS.
  Route: devops-[service-mesh](../../DevOps_and_Cloud/Observability_and_SecOps/service-mesh/SKILL.md)
  Reason: "Service mesh request."

State: User asks about FinOps, cloud cost, cost optimization.
  Route: [devops-finops](../../DevOps_and_Cloud/Cloud_Providers/finops/SKILL.md)
  Reason: "FinOps request."

State: User asks about backup, disaster recovery, DR plan.
  Route: devops-[backup-dr](../../Software_Engineering_and_Other/Frontend/backup-dr/SKILL.md)
  Reason: "Backup/DR request."

State: User asks about database migration, schema migration, Flyway, Liquibase.
  Route: devops-[database-migration](../../Software_Engineering_and_Other/Databases/database-migration/SKILL.md)
  Reason: "Database migration request."

State: User asks about PR description, pull request, write PR.
  Route: [dev-loop-pr-writer](../pr-writer/SKILL.md)
  Reason: "PR writer request."

State: User asks about dev container, devcontainer, dev environment.
  Route: [dev-loop-dev-container](../../Software_Engineering_and_Other/Miscellaneous/dev-container/SKILL.md)
  Reason: "Dev container request."

State: User asks about tech debt, technical debt, code debt.
  Route: [dev-loop-tech-debt-tracker](../../Software_Engineering_and_Other/Frontend/tech-debt-tracker/SKILL.md)
  Reason: "Tech debt tracker request."

State: User asks about API client, curl command, HTTP request generation.
  Route: [dev-loop-api-client-generator](../../Software_Engineering_and_Other/Backend/api-client-generator/SKILL.md)
  Reason: "API client request."

State: User asks about OKR, KPI, goals, key results.
  Route: [management-okr-kpi](../okr-kpi/SKILL.md)
  Reason: "OKR/KPI request."

State: User asks about sprint retro, retrospective, retro.
  Route: management-sprint-retro
  Reason: "Sprint retro request."

State: User asks about risk management, risk register, risk assessment.
  Route: [management-risk-management](../../DevOps_and_Cloud/Observability_and_SecOps/risk-management/SKILL.md)
  Reason: "Risk management request."

State: User asks about roadmap, product roadmap, feature roadmap.
  Route: [planning-create-roadmap](../../Software_Engineering_and_Other/Frontend/create-roadmap/SKILL.md)
  Reason: "Roadmap request."

State: User asks about pitch deck, investor pitch, fundraising.
  Route: [planning-create-pitch-deck](../create-pitch-deck/SKILL.md)
  Reason: "Pitch deck request."

State: User asks about market analysis, competitive analysis, market sizing.
  Route: [planning-market-analysis](../market-analysis/SKILL.md)
  Reason: "Market analysis request."

State: User asks about onboarding, new developer setup, getting started.
  Route: [core-onboarding](../../Software_Engineering_and_Other/Frontend/onboarding/SKILL.md)
  Reason: "Onboarding request."

State: User asks about context compression, token budget, summarize.
  Route: [core-context-compressor](../../Software_Engineering_and_Other/Patterns/context-compressor/SKILL.md)
  Reason: "Context compression request."

State: User asks about compliance, [audit](../../AI_and_Agents/Operations/audit/SKILL.md), SOC2, ISO27001, GDPR.
  Route: [enterprise-compliance-audit](../../DevOps_and_Cloud/Observability_and_SecOps/compliance-[audit](../../AI_and_Agents/Operations/audit/SKILL.md)/SKILL.md)
  Reason: "Compliance/[audit](../../AI_and_Agents/Operations/audit/SKILL.md) request."

State: User asks about multi-tenant, SaaS architecture, tenant isolation.
  Route: [enterprise-multi-tenant](../../Software_Engineering_and_Other/Patterns/multi-tenant/SKILL.md)
  Reason: "Multi-tenant request."

State: User asks about enterprise integration, legacy integration, ESB.
  Route: [enterprise-integration-patterns](../../DevOps_and_Cloud/Observability_and_SecOps/integration-patterns/SKILL.md)
  Reason: "Enterprise integration request."

State: User asks about data governance, data classification, data lineage.
  Route: [enterprise-data-governance](../../DevOps_and_Cloud/Observability_and_SecOps/data-governance/SKILL.md)
  Reason: "Data governance request."

State: User asks about SLA, SLO, error budget, uptime, availability.
  Route: [enterprise-sla-management](../../DevOps_and_Cloud/Observability_and_SecOps/sla-management/SKILL.md)
  Reason: "SLA management request."

State: User asks about legacy migration, strangler fig, system migration.
  Route: [enterprise-legacy-migration](../../Software_Engineering_and_Other/Miscellaneous/legacy-migration/SKILL.md)
  Reason: "Legacy migration request."

State: User asks about identity provider, IdP, SSO, SAML, OIDC, Keycloak.
  Route: [enterprise-identity-provider](../../Software_Engineering_and_Other/Miscellaneous/identity-provider/SKILL.md)
  Reason: "Identity provider request."

State: User asks about cost governance, cloud cost, FinOps, budget management.
  Route: [enterprise-cost-governance](../../DevOps_and_Cloud/Cloud_Providers/cost-governance/SKILL.md)
  Reason: "Cost governance request."

State: User asks about product analytics, event tracking, funnel, retention.
  Route: [product-analytics](../../Software_Engineering_and_Other/Miscellaneous/analytics/SKILL.md)
  Reason: "Product analytics request."

State: User asks about A/B test, split test, experiment, hypothesis testing.
  Route: [product-ab-testing](../../Software_Engineering_and_Other/Miscellaneous/ab-testing/SKILL.md)
  Reason: "A/B testing request."

State: User asks about user research, user interview, persona, usability.
  Route: [product-user-research](../../DevOps_and_Cloud/Observability_and_SecOps/user-research/SKILL.md)
  Reason: "User research request."

State: User asks about growth engineering, viral loop, PLG, activation.
  Route: [product-growth-engineering](../growth-engineering/SKILL.md)
  Reason: "Growth engineering request."

State: User asks about pricing, pricing strategy, monetization, tiers.
  Route: [product-pricing-strategy](../pricing-strategy/SKILL.md)
  Reason: "Pricing strategy request."

State: User asks about go-to-market, GTM, product launch, market entry.
  Route: [product-go-to-market](../go-to-market/SKILL.md)
  Reason: "Go-to-market request."

State: User asks about onboarding flow, user activation, product tour.
  Route: [product-onboarding-flow](../onboarding-flow/SKILL.md)
  Reason: "Onboarding flow request."

State: User asks about prioritization, RICE, Kano, backlog prioritization.
  Route: product-feature-prioritization
  Reason: "Feature prioritization request."

State: User asks about AI, LLM, prompt engineering, RAG, vector database.
  Route: ai-prompt-engineering
  Reason: "AI/prompt engineering request."

State: User asks about RAG, retrieval augmented generation, chunking.
  Route: ai-rag-patterns
  Reason: "RAG request."

State: User asks about LLMOps, model serving, fine-tuning, token cost.
  Route: ai-llm-ops
  Reason: "LLM Ops request."

State: User asks about vector database, Pinecone, Chroma, Qdrant, Milvus.
  Route: ai-vector-databases
  Reason: "Vector database request."

State: User asks about AI agent, agentic, function calling, LangChain, CrewAI.
  Route: ai-ai-agents
  Reason: "AI agent request."

State: User asks about AI evaluation, LLM eval, RAGAS, hallucination test.
  Route: ai-ai-evals
  Reason: "AI evaluation request."

State: User asks about SAST, DAST, static analysis, Semgrep, SonarQube, code scanning.
  Route: [security-sast-dast](../../Security/sast-dast/SKILL.md)
  Reason: "SAST/DAST request."

State: User asks about SBOM, software bill of materials, supply chain security.
  Route: [security-sbom](../../Security/sbom/SKILL.md)
  Reason: "SBOM request."

State: User asks about secrets management, secret scanning, GitLeaks, [vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).
  Route: security-[secrets-management](../../DevOps_and_Cloud/Cloud_Providers/secrets-management/SKILL.md)
  Reason: "Secrets management request."

State: User asks about container security, image scanning, Trivy, admission control.
  Route: [security-container-security](../../DevOps_and_Cloud/Containers_and_Orchestration/container-security/SKILL.md)
  Reason: "Container security request."

State: User asks about API security, OWASP API top 10, rate limiting.
  Route: [security-api-security](../../Security/api-security/SKILL.md)
  Reason: "API security request."

State: User asks about ETL, data pipeline, Airflow, dbt, data transformation.
  Route: [data-etl-pipeline](../../Data_Engineering/etl-pipeline/SKILL.md)
  Reason: "ETL pipeline request."

State: User asks about data warehouse, Snowflake, BigQuery, Redshift, dimensional model.
  Route: [data-data-warehouse](../../Data_Engineering/data-warehouse/SKILL.md)
  Reason: "Data warehouse request."

State: User asks about BI, dashboard, Metabase, Superset, Looker.
  Route: [data-bi-tools](../../AI_and_Agents/Models_and_FineTuning/bi-tools/SKILL.md)
  Reason: "BI tools request."

State: User asks about data quality, Great Expectations, data validation, data contract.
  Route: [data-data-quality](../../Data_Engineering/data-quality/SKILL.md)
  Reason: "Data quality request."

State: User asks about design system, design tokens, Storybook, Figma.
  Route: design-[design-systems](../../Software_Engineering_and_Other/Frontend/design-systems/SKILL.md)
  Reason: "Design system request."

State: User asks about UX research, user research, usability testing, persona.
  Route: [design-ux-research](../ux-research/SKILL.md)
  Reason: "UX research request."

State: User asks about accessibility, WCAG, a11y, screen reader, ARIA.
  Route: design-accessibility
  Reason: "Accessibility request."

State: User asks about prototyping, design prototype, micro-interaction.
  Route: design-prototyping
  Reason: "Prototyping request."

State: User asks about visual design, color theory, typography, layout, visual hierarchy, spacing, UI aesthetics.
  Route: [design-visual-design](../../Software_Engineering_and_Other/Frontend/visual-design/SKILL.md)
  Reason: "Visual design request."

State: User asks about brand identity, brand guidelines, logo design, brand colors, brand voice, visual identity, branding.
  Route: [design-brand-identity](../brand-identity/SKILL.md)
  Reason: "Brand identity request."

State: User asks about information architecture, sitemap, user flow, content hierarchy, navigation design, taxonomy, labeling.
  Route: [design-information-architecture](../information-architecture/SKILL.md)
  Reason: "Information architecture request."

State: User asks about motion design, UI animation, micro-interaction, Lottie, transition design, motion guidelines.
  Route: [design-motion-design](../motion-design/SKILL.md)
  Reason: "Motion design request."

State: User asks about E2E test, Playwright, Cypress, browser test.
  Route: [quality-e2e-testing](../../Software_Engineering_and_Other/Testing/e2e-testing/SKILL.md)
  Reason: "E2E testing request."

State: User asks about visual testing, visual regression, Percy, Chromatic.
  Route: [quality-visual-testing](../../Software_Engineering_and_Other/Testing/visual-testing/SKILL.md)
  Reason: "Visual testing request."

State: User asks about load testing, k6, Locust, performance test.
  Route: quality-[load-testing](../../DevOps_and_Cloud/Observability_and_SecOps/load-testing/SKILL.md)
  Reason: "Load testing request."

State: User asks about contract testing, Pact, consumer-driven contract.
  Route: [quality-contract-testing](../../Software_Engineering_and_Other/Testing/contract-testing/SKILL.md)
  Reason: "Contract testing request."

State: User asks about unit testing, unit test, TDD, test doubles, mocking, stubbing, FIRST principles, AAA pattern, code coverage.
  Route: [quality-unit-testing](../../Software_Engineering_and_Other/Testing/unit-testing/SKILL.md)
  Reason: "Unit testing request."

State: User asks about integration testing, API testing, database testing, TestContainers, WireMock, component testing, service testing.
  Route: [quality-integration-testing](../../Software_Engineering_and_Other/Testing/integration-testing/SKILL.md)
  Reason: "Integration testing request."

State: User asks about property-based testing, fuzzing, generative testing, fast-check, QuickCheck, invariant testing, random testing.
  Route: [quality-property-based-testing](../../Software_Engineering_and_Other/Frontend/property-based-testing/SKILL.md)
  Reason: "Property-based testing request."

State: User asks about Express, Express.js middleware, Express app.
  Route: nodejs-express
  Reason: "Express request."

State: User asks about Prisma, Prisma schema, Prisma ORM.
  Route: prisma
  Reason: "Prisma ORM request."

State: User asks about payment processing, payment gateway, Stripe, PayPal, subscription billing, PCI DSS, recurring payment.
  Route: [ecommerce-payment-processing](../payment-processing/SKILL.md)
  Reason: "Payment processing request."

State: User asks about shopping cart, checkout flow, cart management, order management, coupon system, discount engine, tax calculation.
  Route: [ecommerce-checkout-cart](../../DevOps_and_Cloud/Observability_and_SecOps/checkout-cart/SKILL.md)
  Reason: "Checkout and cart request."

State: User asks about GraphQL Federation, Apollo Federation, federated schema, subgraph, supergraph, schema composition, distributed GraphQL.
  Route: [api-graphql-federation](../../Software_Engineering_and_Other/Patterns/graphql-federation/SKILL.md)
  Reason: "GraphQL Federation request."

State: User asks about API product management, API strategy, API monetization, developer portal, API lifecycle, API deprecation, API as product.
  Route: [api-product-management](../../Software_Engineering_and_Other/Backend/product-management/SKILL.md)
  Reason: "API product management request."

State: User asks about WebRTC, real-time video/audio, media streaming, SFU, MCU, signaling server, TURN/STUN, live streaming, real-time communication.
  Route: [backend-web-real-time](../../Software_Engineering_and_Other/Backend/web-real-time/SKILL.md)
  Reason: "Web real-time communication request."

### Step 3: Detect Backend Stack
Read project files:
- package.json: if @nestjs/core present -> nestjs-patterns
- package.json: if elysia present or bun detected -> elysia-patterns
- package.json: if no @nestjs/core, no elysia, has express/fastify/hono -> nodejs-architecture
- go.mod -> golang-patterns
- Cargo.toml -> rust-patterns
- Gemfile -> backend-rails
- requirements.txt: if fastapi present -> [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-fastapi; if django present -> [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-django; if flask present -> [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-flask
- pyproject.toml: if django present -> [python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)-django
- pom.xml -> backend-spring-boot-architecture; if quarkus present -> java-quarkus; if [micronaut](../../Software_Engineering_and_Other/Backend/micronaut/SKILL.md) present -> java-[micronaut](../../Software_Engineering_and_Other/Backend/micronaut/SKILL.md)
- build.gradle -> backend-spring-boot-architecture; if kotlin -> backend-kotlin-architecture
- build.gradle.kts: if kotlin and [android](../../Mobile/android/SKILL.md) -> mobile-[android](../../Mobile/android/SKILL.md); if kotlin only -> backend-kotlin-architecture
- *.csproj or *.sln -> dotnet-architecture
- composer.json: if symfony in require -> php-symfony; if laravel in require -> [php-laravel](../../Software_Engineering_and_Other/Backend/laravel/SKILL.md); if laminas/zend -> [php-zend](../../Software_Engineering_and_Other/Backend/zend/SKILL.md); else -> [php-pure](../../Software_Engineering_and_Other/Miscellaneous/pure/SKILL.md)
- Package.swift: if vapor in deps -> swift-vapor
- mix.exs -> backend-[elixir](../../Software_Engineering_and_Other/Languages/elixir/SKILL.md)
- deno.json / deno.lock -> backend-deno
- bun.lock / bun.lockb -> backend-bun
- None detected -> ask user

### Step 4: Detect Frontend Framework
- package.json: if @sveltejs/kit present -> frontend-[sveltekit](../../Software_Engineering_and_Other/Frontend/sveltekit/SKILL.md)
- package.json: if next present -> [react-nextjs](../../Software_Engineering_and_Other/Frontend/nextjs/SKILL.md)
- package.json: if react present but no next -> react-architecture
- package.json: if vue present -> [vue-architecture](../../Software_Engineering_and_Other/Patterns/architecture/SKILL.md)
- package.json: if nuxt present -> [vue-nuxt](../../Software_Engineering_and_Other/Frontend/nuxt/SKILL.md)
- package.json: if @angular/core -> angular-architecture
- angular.json -> angular-architecture
- package.json: if remix -> frontend-remix-architecture
- package.json: if astro -> frontend-astro-architecture
- package.json: if solid-js -> solidjs-architecture
- package.json: if @builder.io/qwik -> qwik-architecture
- None detected -> ask user

### Step 5: Detect Mobile Stack
- pubspec.yaml -> mobile-flutter
- package.json: if react-native present -> react-native
- Package.swift or *.xcworkspace -> mobile-ios
- build.gradle.kts / settings.gradle.kts with kotlin -> mobile-[android](../../Mobile/android/SKILL.md)
- None detected -> skip mobile stack

### Step 6: Detect Desktop Stack
- package.json: if electron present -> [desktop-electron](../../Software_Engineering_and_Other/Frontend/electron/SKILL.md)
- Cargo.toml: if tauri in deps -> desktop-tauri
- None detected -> skip desktop stack

## Rules
- This skill produces ZERO code. No implementation. No debugging. No advice.
- End EVERY response with exactly one of the three templates in Response Format.
- If multiple skills could apply, pick the one with the highest priority (earliest phase).
- If you cannot determine the stack, ask. Do not guess.
- Never explain why you chose the skill. The template already contains "Reason."
- If the user asks a question outside routing (e.g., "how do I do X"), respond with: "That question should be handled by {[skill-name](../../DevOps_and_Cloud/Observability_and_SecOps/_template/SKILL.md)}. Activate that skill with: {trigger phrase}"

## References
  - ../../../Global_References/master-orchestrator-advanced.md — Master Orchestrator Advanced Topics
  - ../../../Global_References/master-orchestrator-fundamentals.md — Master Orchestrator Fundamentals
  - ../../../Global_References/orchestration-engine.md — Master Orchestrator
  - ../../../Global_References/orchestrator-registration.md — Orchestrator Registration
  - ../../../Global_References/phase-workflow.md — Phase Workflow Reference
  - ../../../Global_References/routing-decision-tree.md — Routing Decision Tree
  - ../../../Global_References/skill-registry.md — Skill Registry
  - ../../../Global_References/skill-routing.md — Skill Routing Reference
## Handoff
This skill does not produce artifacts. It routes to the appropriate next skill.
Carry forward: routing decision, detected stack, detected framework, existing artifacts found.

