---
name: uv-package-manager
description: Master the uv package manager for fast Python dependency
  management, virtual environments, and modern Python project workflows. Use
  when setting up Python projects, managing dependencies, or optimizing Python
  development workflows with uv.
tags:
  - languages
  - uv-package-manager
depends_on: []
---

# UV Package Manager

Comprehensive guide to using uv, an extremely fast [Python](../python/SKILL.md) package installer and resolver written in Rust, for modern [Python](../python/SKILL.md) project management and dependency workflows.

## When to Use This Skill

- Setting up new [Python](../python/SKILL.md) projects quickly
- Managing [Python](../python/SKILL.md) dependencies faster than pip
- Creating and managing virtual environments
- Installing [Python](../python/SKILL.md) interpreters
- Resolving dependency conflicts efficiently
- Migrating from pip/pip-tools/poetry
- Speeding up CI/CD pipelines
- Managing [monorepo](../../Frontend/monorepo/SKILL.md) [Python](../python/SKILL.md) projects
- Working with lockfiles for reproducible builds
- Optimizing [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) builds with [Python](../python/SKILL.md) dependencies

## Core Concepts

### 1. What is uv?

- **Ultra-fast package installer**: 10-100x faster than pip
- **Written in Rust**: Leverages Rust's performance
- **Drop-in pip replacement**: Compatible with pip workflows
- **Virtual environment manager**: Create and manage venvs
- **[Python](../python/SKILL.md) installer**: Download and manage [Python](../python/SKILL.md) versions
- **Resolver**: Advanced dependency resolution
- **Lockfile support**: Reproducible installations

### 2. Key Features

- Blazing fast installation speeds
- Disk space efficient with global cache
- Compatible with pip, pip-tools, poetry
- Comprehensive dependency resolution
- Cross-platform support (Linux, macOS, Windows)
- No [Python](../python/SKILL.md) required for installation
- Built-in virtual environment support

### 3. UV vs Traditional Tools

- **vs pip**: 10-100x faster, better resolver
- **vs pip-tools**: Faster, simpler, better UX
- **vs poetry**: Faster, less opinionated, lighter
- **vs conda**: Faster, [Python](../python/SKILL.md)-focused

## Installation

### Quick Install

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Using pip (if you already have [Python](../python/SKILL.md))
pip install uv

# Using Homebrew (macOS)
brew install uv

# Using cargo (if you have Rust)
cargo install --git https://[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).com/astral-sh/uv uv
```

### Verify Installation

```bash
uv --version
# uv 0.x.x
```

## Quick Start

### Create a New Project

```bash
# Create new project with virtual environment
uv init my-project
cd my-project

# Or create in current directory
uv init .

# Initialize creates:
# - .[python](../python/SKILL.md)-version ([Python](../python/SKILL.md) version)
# - pyproject.toml (project config)
# - README.md
# - .gitignore
```

### Install Dependencies

```bash
# Install packages (creates venv if needed)
uv add requests pandas

# Install dev dependencies
uv add --dev pytest black ruff

# Install from requirements.txt
uv pip install -r requirements.txt

# Install from pyproject.toml
uv sync
```

## Virtual Environment Management

### Pattern 1: Creating Virtual Environments

```bash
# Create virtual environment with uv
uv venv

# Create with specific [Python](../python/SKILL.md) version
uv venv --[python](../python/SKILL.md) 3.12

# Create with custom name
uv venv my-env

# Create with system site packages
uv venv --system-site-packages

# Specify location
uv venv /path/to/venv
```

### Pattern 2: Activating Virtual Environments

```bash
# Linux/macOS
source .venv/bin/activate

# Windows (Command Prompt)
.venv\Scripts\activate.bat

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Or use uv run (no activation needed)
uv run [python](../python/SKILL.md) script.py
uv run pytest
```

### Pattern 3: Using uv run

```bash
# Run [Python](../python/SKILL.md) script (auto-activates venv)
uv run [python](../python/SKILL.md) app.py

# Run installed CLI tool
uv run black .
uv run pytest

# Run with specific [Python](../python/SKILL.md) version
uv run --[python](../python/SKILL.md) 3.11 [python](../python/SKILL.md) script.py

# Pass arguments
uv run [python](../python/SKILL.md) script.py --arg value
```

## Package Management

### Pattern 4: Adding Dependencies

```bash
# Add package (adds to pyproject.toml)
uv add requests

# Add with version constraint
uv add "django>=4.0,<5.0"

# Add multiple packages
uv add numpy pandas matplotlib

# Add dev dependency
uv add --dev pytest pytest-cov

# Add optional dependency group
uv add --optional docs sphinx

# Add from git
uv add git+https://[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).com/user/repo.git

# Add from git with specific ref
uv add git+https://[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).com/user/repo.git@v1.0.0

# Add from local path
uv add ./local-package

# Add editable local package
uv add -e ./local-package
```

### Pattern 5: Removing Dependencies

```bash
# Remove package
uv remove requests

# Remove dev dependency
uv remove --dev pytest

# Remove multiple packages
uv remove numpy pandas matplotlib
```

### Pattern 6: Upgrading Dependencies

```bash
# Upgrade specific package
uv add --upgrade requests

# Upgrade all packages
uv sync --upgrade

# Upgrade package to latest
uv add --upgrade requests

# Show what would be upgraded
uv tree --outdated
```

### Pattern 7: Locking Dependencies

```bash
# Generate uv.lock file
uv lock

# Update lock file
uv lock --upgrade

# Lock without installing
uv lock --no-install

# Lock specific package
uv lock --upgrade-package requests
```

## [Python](../python/SKILL.md) Version Management

### Pattern 8: Installing [Python](../python/SKILL.md) Versions

```bash
# Install [Python](../python/SKILL.md) version
uv [python](../python/SKILL.md) install 3.12

# Install multiple versions
uv [python](../python/SKILL.md) install 3.11 3.12 3.13

# Install latest version
uv [python](../python/SKILL.md) install

# List installed versions
uv [python](../python/SKILL.md) list

# Find available versions
uv [python](../python/SKILL.md) list --all-versions
```

### Pattern 9: Setting [Python](../python/SKILL.md) Version

```bash
# Set [Python](../python/SKILL.md) version for project
uv [python](../python/SKILL.md) pin 3.12

# This creates/updates .[python](../python/SKILL.md)-version file

# Use specific [Python](../python/SKILL.md) version for command
uv --[python](../python/SKILL.md) 3.11 run [python](../python/SKILL.md) script.py

# Create venv with specific version
uv venv --[python](../python/SKILL.md) 3.12
```

## Project Configuration

### Pattern 10: pyproject.toml with uv

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "My awesome project"
readme = "README.md"
requires-[python](../python/SKILL.md) = ">=3.8"
dependencies = [
    "requests>=2.31.0",
    "pydantic>=2.0.0",
    "click>=8.1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.5.0",
]
docs = [
    "sphinx>=7.0.0",
    "sphinx-rtd-theme>=1.3.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    # Additional dev dependencies managed by uv
]

[tool.uv.sources]
# Custom package sources
my-package = { git = "https://[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).com/user/repo.git" }
```

### Pattern 11: Using uv with Existing Projects

```bash
# Migrate from requirements.txt
uv add -r requirements.txt

# Migrate from poetry
# Already have pyproject.toml, just use:
uv sync

# Export to requirements.txt
uv pip freeze > requirements.txt

# Export with hashes
uv pip freeze --require-hashes > requirements.txt
```

For advanced workflows including [Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) integration, lockfile management, performance optimization, tool comparison, common workflows, tool integration, troubleshooting, best practices, migration guides, and command reference, see [../../../Global_References/uv-package-manager_advanced-patterns.md](../../../Global_References/uv-package-manager_advanced-patterns.md)

