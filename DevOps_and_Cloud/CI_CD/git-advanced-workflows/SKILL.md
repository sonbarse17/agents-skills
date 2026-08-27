---
name: git-advanced-workflows
description: Master advanced Git workflows including rebasing, cherry-picking, bisect, worktrees, and reflog to maintain clean history and recover from any situation. Use when managing complex Git histories, collaborating on feature branches, or troubleshooting repository issues.
---

# Git Advanced Workflows

Master advanced Git techniques to maintain clean history, collaborate effectively, and recover from any situation with confidence.

## When to Use This Skill

- Cleaning up [commit](../commit/SKILL.md) history before merging
- Applying specific commits across branches
- Finding commits that introduced bugs
- Working on multiple features simultaneously
- Recovering from Git mistakes or lost commits
- Managing complex branch workflows
- Preparing clean PRs for review
- Synchronizing diverged branches

## Core Concepts

### 1. Interactive Rebase

Interactive rebase is the Swiss Army knife of Git history editing.

**Common Operations:**

- `pick`: Keep [commit](../commit/SKILL.md) as-is
- `reword`: Change [commit](../commit/SKILL.md) message
- `edit`: Amend [commit](../commit/SKILL.md) content
- `squash`: Combine with previous [commit](../commit/SKILL.md)
- `fixup`: Like squash but discard message
- `drop`: Remove [commit](../commit/SKILL.md) entirely

**Basic Usage:**

```bash
# Rebase last 5 commits
git rebase -i HEAD~5

# Rebase all commits on current branch
git rebase -i $(git merge-base HEAD main)

# Rebase onto specific [commit](../commit/SKILL.md)
git rebase -i abc123
```

### 2. Cherry-Picking

Apply specific commits from one branch to another without merging entire branches.

```bash
# Cherry-pick single [commit](../commit/SKILL.md)
git cherry-pick abc123

# Cherry-pick range of commits (exclusive start)
git cherry-pick abc123..def456

# Cherry-pick without committing (stage changes only)
git cherry-pick -n abc123

# Cherry-pick and edit [commit](../commit/SKILL.md) message
git cherry-pick -e abc123
```

### 3. Git Bisect

Binary search through [commit](../commit/SKILL.md) history to find the [commit](../commit/SKILL.md) that introduced a bug.

```bash
# Start bisect
git bisect start

# Mark current [commit](../commit/SKILL.md) as bad
git bisect bad

# Mark known good [commit](../commit/SKILL.md)
git bisect good v1.0.0

# Git will checkout middle [commit](../commit/SKILL.md) - test it
# Then mark as good or bad
git bisect good  # or: git bisect bad

# Continue until bug found
# When done
git bisect reset
```

**Automated Bisect:**

```bash
# Use script to test automatically
git bisect start HEAD v1.0.0
git bisect run ./test.sh

# test.sh should exit 0 for good, 1-127 (except 125) for bad
```

### 4. Worktrees

Work on multiple branches simultaneously without stashing or switching.

```bash
# List existing worktrees
git worktree list

# Add new worktree for feature branch
git worktree add ../project-feature feature/new-feature

# Add worktree and create new branch
git worktree add -b bugfix/urgent ../project-hotfix main

# Remove worktree
git worktree remove ../project-feature

# Prune stale worktrees
git worktree prune
```

### 5. Reflog

Your safety net - tracks all ref movements, even deleted commits.

```bash
# View reflog
git reflog

# View reflog for specific branch
git reflog show feature/branch

# Restore deleted [commit](../commit/SKILL.md)
git reflog
# Find [commit](../commit/SKILL.md) hash
git checkout abc123
git branch recovered-branch

# Restore deleted branch
git reflog
git branch deleted-branch abc123
```

## Detailed patterns and worked examples

Detailed pattern documentation lives in `../../../Global_References/git-advanced-workflows_details.md`. Read that file when the navigation tier above is insufficient.

## Best Practices

1. **Always Use --force-with-lease**: Safer than --force, prevents overwriting others' work
2. **Rebase Only Local Commits**: Don't rebase commits that have been pushed and shared
3. **Descriptive [Commit](../commit/SKILL.md) Messages**: Future you will thank present you
4. **Atomic Commits**: Each [commit](../commit/SKILL.md) should be a single logical change
5. **Test Before Force Push**: Ensure history rewrite didn't break anything
6. **Keep Reflog Aware**: Remember reflog is your safety net for 90 days
7. **Branch Before Risky Operations**: Create backup branch before complex rebases

```bash
# Safe force push
git push --force-with-lease origin feature/branch

# Create backup before risky operation
git branch backup-branch
git rebase -i main
# If something goes wrong
git reset --hard backup-branch
```

## Common Pitfalls

- **Rebasing Public Branches**: Causes history conflicts for collaborators
- **Force Pushing Without Lease**: Can overwrite teammate's work
- **Losing Work in Rebase**: Resolve conflicts carefully, test after rebase
- **Forgetting Worktree Cleanup**: Orphaned worktrees consume disk space
- **Not Backing Up Before Experiment**: Always create safety branch
- **Bisect on Dirty Working Directory**: [Commit](../commit/SKILL.md) or stash before bisecting

## Recovery Commands

```bash
# Abort operations in progress
git rebase --abort
git merge --abort
git cherry-pick --abort
git bisect reset

# Restore file to version from specific [commit](../commit/SKILL.md)
git restore --source=abc123 path/to/file

# Undo last [commit](../commit/SKILL.md) but keep changes
git reset --soft HEAD^

# Undo last [commit](../commit/SKILL.md) and discard changes
git reset --hard HEAD^

# Recover deleted branch (within 90 days)
git reflog
git branch recovered-branch abc123
```

