---
name: dev-loop-dev-container
description: >
  Use when the user asks about development containers, devcontainer.json, Dev
  Containers in VS Code/GitHub Codespaces, Docker-based dev environments, or
  reproducible development setups. Do NOT use for: production Dockerfiles, or
  CI/CD pipelines.
version: 2.0.0
author: j4flmao
license: MIT
compatibility:
  claude-code: true
  cursor: true
  codex: true
  windsurf: true
tags:
  - dev-loop
  - dev-container
  - docker
  - vscode
  - codespaces
depends_on: []
---

# Dev Container

## Purpose
Create and configure development containers — [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-based, consistent development environments defined by a `devcontainer.json` and Dockerfile. Dev containers ensure all team members (and CI) use identical tools, runtimes, and configurations, eliminating "works on my machine" issues.

## Agent Protocol

### Trigger
Exact user phrases: "dev container", "devcontainer.json", "development container", "VS Code Dev Container", "[GitHub](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Codespaces", "dev environment setup", "reproducible dev environment", "containerized dev", "[Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) dev environment", "remote container".

### Input Context
- Language runtime (Node.js, [Python](../../Languages/python/SKILL.md), Go, Rust, Java, .NET, Ruby, PHP)
- Build tools (npm, pip, cargo, maven, gradle, make, cmake)
- Services needed ([PostgreSQL](../../Backend/postgresql/SKILL.md), Redis, [MySQL](../../Backend/mysql/SKILL.md), [MongoDB](../../Backend/mongodb/SKILL.md), RabbitMQ, Elasticsearch)
- VS Code extensions required for development
- Post-create setup steps (npm install, database migrations, seed data)
- Platform (VS Code, [GitHub](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Codespaces, JetBrains Remote, DevPod)
- Base image preference (mcr.microsoft.com/devcontainers/*, debian, ubuntu, alpine)

### Output Artifact
Complete dev container configuration with Dockerfile, devcontainer.json, and [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose (if multi-service).

### Completion Criteria
- [ ] devcontainer.json configured with image or Dockerfile
- [ ] Dockerfile defined (or base image selected) with all required tools
- [ ] VS Code extensions listed (or JetBrains gateway config)
- [ ] Mount/bind mount configuration for source code
- [ ] Port forwarding configured for application and services
- [ ] Environment variables set (or .env file reference)
- [ ] Post-create command configured (install dependencies)
- [ ] Multi-service setup via [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose (if needed)
- [ ] Container user permissions configured (avoid root)
- [ ] Git credential forwarding configured
- [ ] Features selected from devcontainer-features registry

### Max Response Length
200 lines.

## Framework/Methodology

### Dev Container Decision Tree
```
What is the project type?
├── Single runtime, no services → Dockerfile-based
│   base: mcr.microsoft.com/devcontainers/[typescript](../../Frontend/typescript/SKILL.md)-node:20
│   → apt install tools → npm install → done
├── Single runtime + databases → [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose
│   app container + postgres + redis containers
│   → depends_on, network, healthcheck
├── Polyglot / multiple runtimes → Feature-based
│   base: debian + features (node, [python](../../Languages/python/SKILL.md), go)
│   → ghcr.io/devcontainers/features/*
├── GPU / CUDA development → GPU-enabled base
│   base: mcr.microsoft.com/devcontainers/cuda
│   → nvidia-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) runtime
└── Embedded / IoT (Rust, C++) → Cross-compilation tools
    → arm-none-eabi-gcc, QEMU, platformio feature
```

### Dev Container Architecture
```
Host Machine (VS Code, Codespaces, JetBrains)
    ↕ Remote-SSH or Remote-Containers
Container ([Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md))
├── Application code (mounted volume)
├── Language runtime (Node, [Python](../../Languages/python/SKILL.md), Go, etc.)
├── Build tools (npm, cargo, make, etc.)
├── VS Code extensions (inside container)
├── Git credentials forwarded
├── SSH agent forwarded
├── Ports forwarded (app, debugger, services)
└── [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-outside-[Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) (optional)
    ↓
[Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose (optional multi-service)
├── App container
├── [PostgreSQL](../../Backend/postgresql/SKILL.md) / [MySQL](../../Backend/mysql/SKILL.md) / [MongoDB](../../Backend/mongodb/SKILL.md)
├── Redis / Memcached
└── Other services
```

## Workflow

### Step 1: Create devcontainer.json

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "My App Dev Container",

  // Option A: Use a pre-built dev container image
  "image": "mcr.microsoft.com/devcontainers/[typescript](../../Frontend/typescript/SKILL.md)-node:20",

  // Option B: Build from Dockerfile
  // "build": {
  //   "dockerfile": "Dockerfile",
  //   "args": { "VARIANT": "20" }
  // },

  // Option C: Use [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose
  // "dockerComposeFile": "[docker-compose](../../../DevOps_and_Cloud/Containers_and_Orchestration/[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-compose/SKILL.md).yml",
  // "service": "app",
  // "workspaceFolder": "/workspaces/${localWorkspaceFolderBasename}",

  // Features (additional tools from registry)
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    },
    "ghcr.io/devcontainers/features/[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-outside-of-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md):1": {},
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md)-cli:1": {}
  },

  // VS Code extensions to install
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-[typescript](../../Frontend/typescript/SKILL.md)-next",
    "[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).vscode-[github-actions](../../../DevOps_and_Cloud/CI_CD/[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md)-actions/SKILL.md)",
    "ms-azuretools.vscode-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)"
  ],

  // Settings to apply
  "settings": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "[typescript](../../Frontend/typescript/SKILL.md).updateImportsOnFileMove.enabled": "always",
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  },

  // Ports to forward
  "forwardPorts": [3000, 5432, 6379],

  // Environment variables
  "remoteEnv": {
    "DATABASE_URL": "[postgresql](../../Backend/postgresql/SKILL.md)://user:pass@localhost:5432/myapp",
    "REDIS_URL": "redis://localhost:6379",
    "NODE_ENV": "development"
  },

  // Mounts
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/node/.ssh,type=bind,readonly",
    "source=${localEnv:HOME}/.gitconfig,target=/home/node/.gitconfig,type=bind,readonly"
  ],

  // Commands to run after the container is created
  "postCreateCommand": "npm install && npm run build",
  "postStartCommand": "git config --global --add safe.directory /workspaces/*",
  "postAttachCommand": "npm run dev"
}
```

### Step 2: Custom Dockerfile

```dockerfile
# .devcontainer/Dockerfile
ARG VARIANT="20"
FROM mcr.microsoft.com/devcontainers/[typescript](../../Frontend/typescript/SKILL.md)-node:${VARIANT}

# Install additional system packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        [postgresql](../../Backend/postgresql/SKILL.md)-client \
        redis-tools \
        ripgrep \
        fd-find \
        bat \
        httpie \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm tools
RUN su node -c "npm install -g pnpm tsx eslint prettier"

# Set up shell prompt customization
COPY --chown=node:node .zshrc /home/node/.zshrc
```

### Step 3: [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose for Multi-Service

```yaml
# .devcontainer/[docker-compose](../../../DevOps_and_Cloud/Containers_and_Orchestration/[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-compose/SKILL.md).yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VARIANT: "20"
    volumes:
      - ..:/workspaces:cached
    environment:
      DATABASE_URL: [postgresql](../../Backend/postgresql/SKILL.md)://user:pass@postgres:5432/myapp
      REDIS_URL: redis://redis:6379
    # Overrides default command so things don't shut down
    command: sleep infinity
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    user: node
    networks:
      - dev

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/[postgresql](../../Backend/postgresql/SKILL.md)/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - dev

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - dev

volumes:
  postgres-data:
  redis-data:

networks:
  dev:
```

### Step 4: Post-Create Script

```bash
#!/bin/bash
# .devcontainer/post-create.sh
set -e

echo "🚀 Setting up development environment..."

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "🔧 Creating .env file from template..."
    cp .env.example .env
fi

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed development data
echo "🌱 Seeding database..."
npm run db:seed

# Install git hooks
echo "🔗 Installing git hooks..."
npx husky install

echo "✅ Development environment ready!"
```

### Step 5: [GitHub](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Codespaces Config

```jsonc
// .devcontainer/devcontainer.json (Codespaces-optimized)
{
  "name": "My App",
  "image": "mcr.microsoft.com/devcontainers/[typescript](../../Frontend/typescript/SKILL.md)-node:20",

  // Codespaces machine type recommendation
  "hostRequirements": {
    "cpus": 4,
    "memory": "8gb",
    "storage": "32gb"
  },

  "features": {
    "ghcr.io/devcontainers/features/[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-outside-of-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md):1": {}
  },

  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": {
      "label": "Dev Server",
      "onAutoForward": "notify"
    }
  },

  // Secrets (set in [GitHub](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md) repo settings)
  "remoteEnv": {
    "API_KEY": "${secrets:API_KEY}"
  },

  "onCreateCommand": ".devcontainer/post-create.sh",
  "waitFor": "onCreateCommand",

  "customizations": {
    "codespaces": {
      "openFiles": ["README.md", "src/index.ts"]
    }
  }
}
```

### Step 6: JetBrains Remote Dev

```xml
<!-- .devcontainer/devcontainer.json (with JetBrains support) -->
{
  "name": "My App",
  "image": "mcr.microsoft.com/devcontainers/[typescript](../../Frontend/typescript/SKILL.md)-node:20",
  "extensions": [
    // JB Gateway doesn't use VS Code extensions.
    // Instead, install tools in Dockerfile.
  ],
  "settings": {
    "remote.autoForwardPorts": true,
    "jetbrains.gateway.enabled": true
  },
  // Ports that JetBrains should forward
  "forwardPorts": [3000, 5432]
}
```

### Step 7: CI Validation of Dev Container

```yaml
# .[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md)/workflows/devcontainer-ci.yml
name: Dev Container Validation
on:
  pull_request:
    paths:
      - '.devcontainer/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build dev container
        uses: devcontainers/ci@v3
        with:
          subFolder: .devcontainer
          imageName: ghcr.io/myorg/devcontainer
          cacheFrom: ghcr.io/myorg/devcontainer
          push: never
      - name: Run post-create
        run: [docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) run --rm ghcr.io/myorg/devcontainer /bin/bash -c ".devcontainer/post-create.sh && npm test"
```

## Common Pitfalls

| Pitfall | Description | Prevention |
|---------|-------------|------------|
| Running as root | Container user has file permission issues | Use `remoteUser` in devcontainer.json, match host UID |
| No git credential forwarding | Can't push to remote from container | Configure Git credential helper, SSH agent |
| State loss on rebuild | Database data lost when container rebuilds | Use [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) volumes for persistent data |
| Slow rebuilds | Installing everything from scratch | Use [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) layer caching, feature cache |
| Port conflicts | Multiple projects on same ports | Use different ports per project |
| Missing features | Common tools not installed | Use devcontainer-features registry |
| Large image size | GB-sized images slow to pull | Use slim base images, multi-stage builds |
| No healthcheck for services | App starts before DB is ready | Healthcheck + depends_on condition |
| Hardcoded UID/GID | Doesn't work across teams | Dynamic UID resolution in entrypoint |
| No .env file | Missing environment variables | Copy from .env.example automatically |

## Best Practices

| Practice | Rationale |
|----------|-----------|
| Use [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose for multi-service | DB, cache, and other services in isolated containers |
| Use devcontainer-features | Community-maintained, versioned tool installations |
| Pin base image tags | Avoid unexpected breaking changes from :latest |
| Set remoteUser | Match host file permissions |
| Configure git credentials | Without this, git operations fail inside container |
| Use postCreateCommand for setup | Automatically set up after first build |
| Healthcheck for DB services | App container waits for ready database |
| Mount .gitconfig and .ssh | Preserve host git configuration |
| Keep .devcontainer in version control | All team members use the same setup |
| Test dev container in CI | Ensure it builds and works on every PR |
| Document .env variables | Team knows what needs configuring |
| Use .dockerignore | Exclude node_modules, .git from build context |

## Architecture Patterns

### Minikube/K3s Dev Container
```jsonc
{
  "features": {
    "ghcr.io/devcontainers/features/[kubectl](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubectl/SKILL.md):1": {},
    "ghcr.io/devcontainers/features/helm:1": {},
    "ghcr.io/devcontainers/features/[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-from-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md):1": {},
    "ghcr.io/devcontainers/features/k3d:1": {}
  },
  "postCreateCommand": "k3d cluster create dev"
}
```

### Multi-root Workspace ([Monorepo](../../Frontend/monorepo/SKILL.md))
```jsonc
{
  "name": "My [Monorepo](../../Frontend/monorepo/SKILL.md)",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "workspaceFolder": "/workspaces/myapp",
  "extensions": [...],
  "postCreateCommand": "cd packages/core && npm install && cd ../ui && npm install"
}
```

## References
  - ../../../Global_References/dev-container-advanced.md — Dev Container Advanced Topics
  - ../../../Global_References/dev-container-fundamentals.md — Dev Container Fundamentals
  - references/dev-container-features.md — Dev Container Features Reference
  - references/dev-container-multi-service.md — Multi-Service Dev Container Reference
## Handoff
Hand off to `dev-loop-[git-workflow](../../../DevOps_and_Cloud/CI_CD/git-workflow/SKILL.md)` for Git credential configuration. Hand off to `[dev-loop-security-auditor](../../../DevOps_and_Cloud/Observability_and_SecOps/security-auditor/SKILL.md)` for container security.

## Architecture Decision Trees

### Development Environment Strategy
| Decision Point | Option A | Option B | Decision Criteria |
|---|---|---|---|
| Container base image | Distroless (small, secure) | Full distro (tooling-rich) | Dev experience vs attack surface |
| Package manager | apt + pip | nix/home-manager | Reproducibility vs learning curve |
| Shell | bash | zsh + oh-my-zsh | Portability vs productivity |
| Dotfiles management | Manual COPY in Dockerfile | chezmoi/ dotfiles repo | Simplicity vs flexibility |

### Multi-Service Topology
- **[Monorepo](../../Frontend/monorepo/SKILL.md) single container**: Simple, one DevContainer.json. Good for small projects.
- **[Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose multi-container**: Service-per-container with depends_on. Use for [microservices](../../Patterns/microservices/SKILL.md).
- **[Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) Dev environment**: Dev runs in-cluster with hot-reload. For cloud-native teams.

## Implementation Patterns

### Dockerfile Optimization
`dockerfile
# Multi-stage build for smaller final image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
`

### DevContainer Features Configuration
`json
{
  "name": "Full Stack Dev Container",
  "image": "mcr.microsoft.com/devcontainers/[typescript](../../Frontend/typescript/SKILL.md)-node:20",
  "features": {
    "ghcr.io/devcontainers/features/[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-in-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md):2": {},
    "ghcr.io/devcontainers/features/git-lfs:1": {},
    "ghcr.io/devcontainers/features/sshd:1": {}
  },
  "postCreateCommand": "npm install && npm run build",
  "remoteUser": "node",
  "mounts": [
    "source=C:\Users\Hi/.ssh,target=/home/node/.ssh,type=bind"
  ]
}
`

## Production Considerations

### Performance
- **Layer caching**: Order Dockerfile layers from least to most frequently changing. Keep package installs before source copies.
- **Image size**: Use alpine-based images where possible. Remove package manager cache in same RUN layer.
- **Startup time**: Pre-warm application caches in postCreateCommand. Use ssd-backed volumes for node_modules.

### Reliability
- **Health checks**: Add HEALTHCHECK to Dockerfile. Configure restart policies in compose.
- **Resource limits**: Set CPU and memory limits per container. Use [docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) stats for [monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md).
- **Persistence**: Use named volumes for databases. Bind mounts for configuration.

## Anti-Patterns

| Anti-Pattern | Symptom | Solution |
|---|---|---|
| Dev container as production image | Bloated prod images | Use multi-stage builds, separate dev vs prod |
| Installing everything in one layer | Poor caching, slow rebuilds | Layer strategically by change frequency |
| Ignoring .dockerignore | Large build context, slow sends | Always include .dockerignore |
| Root user in container | Security risk, permission issues | Use dedicated non-root user |
| Hardcoded environment variables | Configuration drift between devs | Use .env file with .env.example template |

## Performance Optimization

### Build Speed
- **Remote build cache**: Use BuildKit cache mounts and remote registry cache. Share layers across team.
- **Parallel builds**: Use [docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) buildx bake for multi-service builds. Leverage --parallel flag.
- **Selective rebuild**: Mount source as volume in dev. Only rebuild when dependencies change.

### Runtime Speed
- **Hot reload**: Use nodemon/air for auto-restart. Reduce feedback loop to < 2 seconds.
- **Startup [profiling](../../Frontend/profiling/SKILL.md)**: Profile container startup with [docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) events. Identify slow initialization.
- **Volume performance**: Use delegated/consistent mount config on macOS. Prefer named volumes for databases.

## Security Considerations

### Container Hardening
- **Non-root user**: Always specify USER in Dockerfile. Use --user flag in compose.
- **Read-only rootfs**: Set read_only: true in compose for stateless containers. Write to tmpfs for temp files.
- **Capability dropping**: Drop ALL capabilities, add only required ones. Use --cap-drop ALL --cap-add NET_BIND_SERVICE.

### Supply Chain
- **Image scanning**: Scan base images with Trivy/Snyk before use. Pin to digest, not tag.
- **Dependency [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)**: Run npm [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/pip [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) in postCreateCommand. Fail on critical vulnerabilities.
- **Signature verification**: Verify image signatures with cosign. Use [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Content Trust for pull.

### Secrets Management
- **Never in image**: Use [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) secrets or .env files mounted at runtime. Never COPY secrets into image.
- **Secret scanning**: Scan for hardcoded secrets in git pre-[commit](../../../DevOps_and_Cloud/CI_CD/commit/SKILL.md) hooks. Use tools like git-secrets or truffleHog.
- **Ephemeral credentials**: Use short-lived tokens with automatic rotation. Integrate with OIDC providers.

