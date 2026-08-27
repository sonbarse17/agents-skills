---
name: docker-management
description: Build, optimize, and troubleshoot Docker containers and images.
  Create efficient Dockerfiles, manage container lifecycle, configure networking
  and volumes, and debug container issues. Use when working with Docker,
  containerization, or container troubleshooting.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - containers_and_orchestration
  - docker-management
depends_on: []
---

# [Docker](../docker/SKILL.md) Management

Build, run, and manage [Docker](../docker/SKILL.md) containers for application deployment and development.

## When to Use This Skill

Use this skill when:
- Creating and optimizing Dockerfiles
- Building and tagging [Docker](../docker/SKILL.md) images
- Running and managing containers
- Debugging container issues
- Configuring [Docker](../docker/SKILL.md) networking and volumes
- Implementing container security best practices

## Prerequisites

- [Docker](../docker/SKILL.md) Engine installed (20.10+)
- Basic command line knowledge
- Understanding of application deployment

## Dockerfile Best Practices

### Multi-Stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Layer Optimization

```dockerfile
FROM [python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md):3.12-slim

# Install dependencies first (cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (changes frequently)
COPY . .

CMD ["[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)", "app.py"]
```

### Security Hardening

```dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser

WORKDIR /app

# Copy with proper ownership
COPY --chown=appuser:appgroup . .

# Drop privileges
USER appuser

# Use exec form for proper signal handling
CMD ["node", "server.js"]
```

## Building Images

### Basic Build

```bash
# Build with tag
[docker](../docker/SKILL.md) build -t myapp:1.0 .

# Build with build args
[docker](../docker/SKILL.md) build --build-arg NODE_ENV=production -t myapp:prod .

# Build for specific platform
[docker](../docker/SKILL.md) build --platform linux/amd64 -t myapp:amd64 .

# Build with no cache
[docker](../docker/SKILL.md) build --no-cache -t myapp:fresh .
```

### Multi-Platform Builds

```bash
# Create builder
[docker](../docker/SKILL.md) buildx create --name multiplatform --use

# Build for multiple architectures
[docker](../docker/SKILL.md) buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myregistry/myapp:latest \
  --push .
```

## Running Containers

### Basic Operations

```bash
# Run container
[docker](../docker/SKILL.md) run -d --name myapp -p 8080:3000 myapp:latest

# Run with environment variables
[docker](../docker/SKILL.md) run -d \
  -e DATABASE_URL=postgres://localhost/db \
  -e NODE_ENV=production \
  myapp:latest

# Run with resource limits
[docker](../docker/SKILL.md) run -d \
  --memory="512m" \
  --cpus="1.0" \
  myapp:latest

# Run with restart policy
[docker](../docker/SKILL.md) run -d --restart=unless-stopped myapp:latest
```

### Volume Management

```bash
# Named volume
[docker](../docker/SKILL.md) volume create mydata
[docker](../docker/SKILL.md) run -v mydata:/app/data myapp:latest

# Bind mount
[docker](../docker/SKILL.md) run -v $(pwd)/config:/app/config:ro myapp:latest

# tmpfs mount (memory)
[docker](../docker/SKILL.md) run --tmpfs /tmp:rw,noexec,nosuid myapp:latest
```

### Networking

```bash
# Create network
[docker](../docker/SKILL.md) network create mynetwork

# Run on network
[docker](../docker/SKILL.md) run -d --network mynetwork --name api myapp:latest

# Connect existing container
[docker](../docker/SKILL.md) network connect mynetwork existing-container

# Expose specific ports
[docker](../docker/SKILL.md) run -d -p 127.0.0.1:8080:3000 myapp:latest
```

## Container Lifecycle

### Management Commands

```bash
# List containers
[docker](../docker/SKILL.md) ps -a

# Stop container
[docker](../docker/SKILL.md) stop myapp

# Remove container
[docker](../docker/SKILL.md) rm myapp

# Force remove running container
[docker](../docker/SKILL.md) rm -f myapp

# Prune stopped containers
[docker](../docker/SKILL.md) container prune -f
```

### Logs and [Monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)

```bash
# View logs
[docker](../docker/SKILL.md) logs myapp

# Follow logs
[docker](../docker/SKILL.md) logs -f --tail 100 myapp

# View resource usage
[docker](../docker/SKILL.md) stats myapp

# Inspect container
[docker](../docker/SKILL.md) inspect myapp
```

## Debugging Containers

### Interactive Access

```bash
# Execute command in running container
[docker](../docker/SKILL.md) exec -it myapp /bin/sh

# Run container with shell
[docker](../docker/SKILL.md) run -it --rm myapp:latest /bin/sh

# Debug failed container
[docker](../docker/SKILL.md) run -it --entrypoint /bin/sh myapp:latest
```

### Troubleshooting

```bash
# Check container logs for errors
[docker](../docker/SKILL.md) logs myapp 2>&1 | grep -i error

# Inspect container state
[docker](../docker/SKILL.md) inspect --format='{{.State.Status}}' myapp

# Check container processes
[docker](../docker/SKILL.md) top myapp

# View container filesystem changes
[docker](../docker/SKILL.md) diff myapp

# Export container filesystem
[docker](../docker/SKILL.md) export myapp > myapp-fs.tar
```

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```bash
# Check health status
[docker](../docker/SKILL.md) inspect --format='{{.State.Health.Status}}' myapp
```

## Image Management

### Tagging and Pushing

```bash
# Tag image
[docker](../docker/SKILL.md) tag myapp:latest myregistry.com/myapp:v1.0

# Push to registry
[docker](../docker/SKILL.md) push myregistry.com/myapp:v1.0

# Pull image
[docker](../docker/SKILL.md) pull myregistry.com/myapp:v1.0
```

### Cleanup

```bash
# Remove unused images
[docker](../docker/SKILL.md) image prune -a

# Remove all unused resources
[docker](../docker/SKILL.md) system prune -a --volumes

# Remove specific image
[docker](../docker/SKILL.md) rmi myapp:old

# List image sizes
[docker](../docker/SKILL.md) images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Image Analysis

```bash
# View image history
[docker](../docker/SKILL.md) history myapp:latest

# Inspect image layers
[docker](../docker/SKILL.md) inspect myapp:latest

# Check image vulnerabilities (with [Docker](../docker/SKILL.md) Scout)
[docker](../docker/SKILL.md) scout cves myapp:latest
```

## [Docker](../docker/SKILL.md) Compose Integration

```yaml
# [docker-compose](../[docker](../docker/SKILL.md)-compose/SKILL.md).yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - app-data:/app/data
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/[postgresql](../../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md)/data

volumes:
  app-data:
  db-data:
```

## Security Best Practices

### Image Security

```dockerfile
# Use specific version tags
FROM node:20.10-alpine3.18

# Don't run as root
USER nobody

# Remove unnecessary packages
RUN apk del --purge build-dependencies

# Use COPY instead of ADD
COPY . .
```

### Runtime Security

```bash
# Run with security options
[docker](../docker/SKILL.md) run -d \
  --security-opt=no-new-privileges \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --read-only \
  myapp:latest

# Use user namespace remapping
# Add to /etc/[docker](../docker/SKILL.md)/daemon.json: {"userns-remap": "default"}
```

## Common Issues

### Issue: Container Exits Immediately
**Problem**: Container starts and stops instantly
**Solution**: Check if CMD/ENTRYPOINT runs foreground process, use `[docker](../docker/SKILL.md) logs` to see errors

### Issue: Cannot Connect to Container
**Problem**: Port not accessible
**Solution**: Verify port mapping (-p), check container is running, verify firewall rules

### Issue: Out of Disk Space
**Problem**: [Docker](../docker/SKILL.md) using too much disk
**Solution**: Run `[docker](../docker/SKILL.md) system prune -a --volumes`, check for large unused images

### Issue: Build Cache Not Working
**Problem**: Every build downloads dependencies
**Solution**: Order Dockerfile instructions from least to most frequently changing

## Best Practices

- Use multi-stage builds to minimize image size
- Never store secrets in images - use runtime injection
- Pin base image versions for reproducibility
- Implement health checks for production containers
- Use .dockerignore to exclude unnecessary files
- Run containers as non-root users
- Scan images for vulnerabilities regularly
- Use [Docker](../docker/SKILL.md) BuildKit for faster builds

## Related Skills

- [docker-compose](../[docker-compose](../[docker](../docker/SKILL.md)-compose/SKILL.md)/) - Multi-container applications
- [container-scanning](../../../security/scanning/[container-scanning](../container-scanning/SKILL.md)/) - Security scanning
- [container-hardening](../../../security/hardening/[container-hardening](../container-hardening/SKILL.md)/) - Security hardening
