---
name: ansible-playbook-and-role-design
description: >
  Designs and safely runs Ansible playbooks, roles, and inventories for
  configuration management, including idempotent task design, Ansible Vault for
  secrets, and choosing config-management (Ansible) versus provisioning
  (Terraform/CloudFormation) for a given change. Use when the user asks to
  "write an Ansible playbook/role for X," "structure an Ansible inventory across
  environments," "make this task idempotent," "encrypt secrets with Ansible
  Vault," "dry-run a playbook before production," or "should this be Ansible or
  Terraform."
license: Apache-2.0
compatibility: Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI
metadata:
  domain: iac-and-automation-tooling
  maturity: stable
tags:
  - infrastructure_as_code
  - ansible-playbook-and-role-design
depends_on: []
---

# [Ansible](../ansible/SKILL.md) Playbook and Role Design

## Purpose

[Ansible](../ansible/SKILL.md) manages the *configuration* of already-existing hosts — installed
packages, running services, config files, users — by describing desired
state as YAML tasks and applying them idempotently over SSH/WinRM with no
agent required on the target. This complements, rather than replaces,
provisioning tools: Terraform/[CloudFormation](../cloudformation/SKILL.md) create the VM, network, and
IAM role that a host needs to exist; [Ansible](../ansible/SKILL.md) then configures what runs on
that host once it's there. See
[infrastructure-as-code-terraform](../../../devops/skills/[infrastructure-as-code-terraform](../[infrastructure-as-code](../infrastructure-as-code/SKILL.md)-terraform/SKILL.md)/SKILL.md)
for the provisioning side of that split, and
[aws-[cloudformation](../cloudformation/SKILL.md)-templates](../[aws-[cloudformation](../cloudformation/SKILL.md)-templates](../aws-[cloudformation](../cloudformation/SKILL.md)-templates/SKILL.md)/SKILL.md)
for the AWS-native equivalent. The operational risk [Ansible](../ansible/SKILL.md) manages is
twofold: idempotency (running the same playbook twice should converge to
the same state, not double-apply changes) and blast radius (a playbook
targets an inventory, and a wrong inventory or missing `--limit` can apply
a change to every production host at once).

## When to use

- Installing/configuring software, managing config files, or ensuring
  services are running/enabled across a fleet of existing servers.
- Structuring reusable, testable units of configuration as roles instead
  of one long flat playbook.
- Managing environment-specific variables (dev/staging/prod) via inventory
  group_vars/host_vars rather than duplicating playbooks per environment.
- Storing secrets (API keys, DB passwords) that a playbook needs, encrypted
  at rest, without putting plaintext in version control.
- Deciding whether a given change belongs in [Ansible](../ansible/SKILL.md) (configuration of
  existing resources) or in a provisioning tool like Terraform/
  [CloudFormation](../cloudformation/SKILL.md) (creating/destroying the resources themselves).
- Running a playbook safely against production for the first time, or
  after a significant change, via a dry run.

## Prerequisites & environment

- [Ansible](../ansible/SKILL.md) ≥ 2.15 (community package) or `[ansible](../ansible/SKILL.md)-core` ≥ 2.15 — the
  collection-based distribution (`[ansible](../ansible/SKILL.md)` meta-package pulling in
  `[ansible](../ansible/SKILL.md).builtin` plus community collections) is standard since [Ansible](../ansible/SKILL.md)
  2.10; confirm which collections a role depends on (e.g.
  `community.general`, `amazon.aws`) are installed via
  `[ansible](../ansible/SKILL.md)-galaxy collection install`.
- SSH key-based access (or WinRM for Windows targets) from the control
  node to every managed host, and [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) present on managed hosts ([Ansible](../ansible/SKILL.md)
  executes modules via a remote [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) interpreter by default).
- `[ansible](../ansible/SKILL.md)-lint` and `yamllint` for static checks; `molecule` (with a
  [Docker](../../Containers_and_Orchestration/docker/SKILL.md) or [Podman](../../Containers_and_Orchestration/podman/SKILL.md) driver) for role testing is recommended for any role
  used beyond a single one-off playbook.
- A [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) password (or an integration with a secrets manager via a [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
  password script) for any playbook referencing [Ansible](../ansible/SKILL.md) [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-encrypted
  variables — never a plaintext password committed to the repo.
- Least-privilege: the SSH/become user [Ansible](../ansible/SKILL.md) connects as should have
  only the `sudo`/`become` rights the playbook's tasks actually need, not
  unrestricted root.

## Step-by-step guidance

1. **Structure inventory by environment, not by one flat host list**:
   ```
   inventories/
     staging/
       hosts.yml
       group_vars/
         all.yml
         webservers.yml
     prod/
       hosts.yml
       group_vars/
         all.yml
         webservers.yml
   roles/
     nginx/
       tasks/main.yml
       handlers/main.yml
       templates/nginx.conf.j2
       defaults/main.yml
       meta/main.yml
   playbooks/
     site.yml
   ```
   `inventories/staging/hosts.yml`:
   ```yaml
   all:
     children:
       webservers:
         hosts:
           web-staging-01.example.internal:
           web-staging-02.example.internal:
   ```
   Running against the wrong environment becomes a conscious `-i` choice,
   not an accident of a shared host list.

2. **Write roles with idempotency as the default, not an afterthought.**
   Prefer built-in modules (which are idempotent by design) over `shell`/
   `command`, which are not idempotent unless explicitly guarded:
   ```yaml
   # roles/nginx/tasks/main.yml
   - name: Install nginx
     [ansible](../ansible/SKILL.md).builtin.package:
       name: nginx
       state: present

   - name: Deploy nginx site config
     [ansible](../ansible/SKILL.md).builtin.template:
       src: nginx.conf.j2
       dest: /etc/nginx/sites-available/app.conf
       owner: root
       group: root
       mode: "0644"
     notify: Reload nginx

   - name: Ensure nginx is enabled and running
     [ansible](../ansible/SKILL.md).builtin.service:
       name: nginx
       state: started
       enabled: true
   ```
   ```yaml
   # roles/nginx/handlers/main.yml
   - name: Reload nginx
     [ansible](../ansible/SKILL.md).builtin.service:
       name: nginx
       state: reloaded
   ```
   The handler only fires when `template` actually changes the file, so
   re-running the playbook with no drift performs zero changes and
   reports `changed=0` — the signal that the role is truly idempotent.
   If a `shell`/`command` task is unavoidable (no module covers the
   action), guard it explicitly:
   ```yaml
   - name: Run one-time migration marker check
     [ansible](../ansible/SKILL.md).builtin.command: /opt/app/bin/migrate --check
     register: migrate_check
     changed_when: "'pending' in migrate_check.stdout"
     failed_when: migrate_check.rc not in [0, 1]
   ```

3. **Use `defaults/main.yml` for overridable role inputs**, and
   `group_vars`/`host_vars` for environment-specific values, so the same
   role runs unmodified in every environment:
   ```yaml
   # roles/nginx/defaults/main.yml
   nginx_worker_connections: 1024
   nginx_client_max_body_size: "10m"
   ```
   ```yaml
   # inventories/prod/group_vars/webservers.yml
   nginx_worker_connections: 4096
   ```

4. **Encrypt secrets with [Ansible](../ansible/SKILL.md) [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)** — never plaintext credentials in
   a playbook or inventory. Show the *pattern*, not a real [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) password:
   ```bash
   [ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) create group_vars/prod/[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).yml
   # Editor opens; contents are encrypted at rest once saved, e.g.:
   #   vault_db_password: "REPLACE_WITH_ACTUAL_SECRET"
   ```
   Reference the vaulted variable from a plain (non-encrypted) variable so
   `group_vars/prod/[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).yml` stays fully encrypted while
   `group_vars/prod/vars.yml` stays diffable in version control:
   ```yaml
   # group_vars/prod/vars.yml (plaintext, safe to [commit](../../CI_CD/commit/SKILL.md))
   db_password: "{{ vault_db_password }}"
   ```
   Run with the [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) password supplied out-of-band (a password manager,
   CI secret store, or `--[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password-file` pointing at a file that is
   itself not committed):
   ```bash
   [ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml \
     --[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password-file /run/secrets/[ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-pass
   ```

5. **Dry-run before any production apply.**
   > **Warning:** Running `[ansible](../ansible/SKILL.md)-playbook` against a production
   > inventory without `--check` first (and ideally `--diff` to see exact
   > file/content changes) risks applying an untested task to every host
   > in that inventory simultaneously — there is no automatic rollback if
   > a task mid-playbook breaks a service. Always dry-run and scope first:
   ```bash
   [ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml \
     --check --diff --limit webservers
   ```
   Review the check-mode output (`changed`/`ok` counts and the `--diff`
   content), then run for real against a narrow slice before the whole
   fleet:
   ```bash
   [ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml \
     --limit "web-prod-01.example.internal" 
   [ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml
   ```
   Note that `--check` is not a perfect predictor for every module —
   modules that depend on runtime state produced by earlier tasks in the
   same run (e.g. a file created by a prior task) may report inaccurately
   in check mode; treat it as a strong signal, not an absolute guarantee.

6. **Compose roles into playbooks by responsibility**, not by
   environment:
   ```yaml
   # playbooks/site.yml
   - name: Configure web tier
     hosts: webservers
     become: true
     roles:
       - role: nginx
       - role: app-runtime
   ```

7. **Know when to reach for a provisioning tool instead.** If the task is
   "create this EC2 instance/VPC/RDS database," that's Terraform/
   [CloudFormation](../cloudformation/SKILL.md) territory (see
   [infrastructure-as-code-terraform](../../../devops/skills/[infrastructure-as-code-terraform](../[infrastructure-as-code](../infrastructure-as-code/SKILL.md)-terraform/SKILL.md)/SKILL.md)
   and
   [aws-[cloudformation](../cloudformation/SKILL.md)-templates](../[aws-[cloudformation](../cloudformation/SKILL.md)-templates](../aws-[cloudformation](../cloudformation/SKILL.md)-templates/SKILL.md)/SKILL.md)).
   If the task is "this host exists — install/configure/run something on
   it," that's [Ansible](../ansible/SKILL.md). Many pipelines chain both: Terraform/[CloudFormation](../cloudformation/SKILL.md)
   provisions and outputs an inventory (e.g. via a dynamic inventory plugin
   like `amazon.aws.aws_ec2`, tag-filtered), then [Ansible](../ansible/SKILL.md) configures the
   result. Avoid using [Ansible](../ansible/SKILL.md)'s `ec2_instance`-style modules to *also*
   own long-lived infrastructure lifecycle in parallel with a provisioning
   tool — pick one owner per resource to avoid both tools fighting over
   the same object.

## Best practices

- Keep roles single-purpose and reusable (`nginx`, `app-runtime`,
  `[monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)-agent`) rather than one monolithic `webserver` role that
  bundles unrelated concerns — smaller roles are independently testable
  and composable across playbooks.
- Pin role/collection dependencies in `requirements.yml` with explicit
  versions, and run `[ansible](../ansible/SKILL.md)-galaxy install -r requirements.yml` in CI
  before every run so a role doesn't silently pick up a breaking upstream
  change.
- Run `[ansible](../ansible/SKILL.md)-lint` and `yamllint` in CI on every PR touching playbooks/
  roles — most idempotency and style issues (bare `shell` where a module
  exists, missing `become`, unpinned package versions) are caught
  statically before ever touching a host.
- Use `serial:` in a playbook targeting many hosts to roll out changes in
  batches rather than all at once, giving a chance to halt on early
  failures:
  ```yaml
  - hosts: webservers
    serial: "25%"
    max_fail_percentage: 10
  ```
- Tag tasks (`tags: [nginx, config]`) so a targeted `--tags`/`--skip-tags`
  run is possible without executing an entire playbook for a small fix.
- Use `molecule test` to run a role's task list against a disposable
  container/VM in CI, asserting both convergence and idempotency (a
  second `molecule converge` run should report zero changes).
- Never [commit](../../CI_CD/commit/SKILL.md) an unencrypted [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) password file or embed it in a
  playbook; inject it at run time from a secrets manager or CI's native
  secret store.

## Common pitfalls

- **Symptom:** Re-running a playbook that already succeeded reports
  `changed` on tasks that shouldn't have anything left to do.
  **Fix:** Usually a `shell`/`command` task without a `changed_when`
  guard, or a template/`lineinfile` task whose rendered output isn't
  byte-stable (e.g. embeds a timestamp). Replace `shell`/`command` with
  the equivalent built-in module where one exists, and add an explicit
  `changed_when` condition when it doesn't.

- **Symptom:** A playbook meant for `staging` accidentally runs against
  every host including `prod` because of a shared inventory group name.
  **Fix:** Use fully separate inventory files/directories per environment
  (as in step 1), not one inventory with environment as just a variable,
  and always pass `-i <specific-inventory>` explicitly rather than
  relying on an `[ansible](../ansible/SKILL.md).cfg` default that could point anywhere.

- **Symptom:** `[ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)`-encrypted variables show up as ciphertext
  errors ("Decryption failed") when running from CI.
  **Fix:** The [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) password isn't reaching the CI runner, or multiple
  [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) IDs are in use without `--[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-id` disambiguating them. Confirm
  the CI job injects `--[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password-file` (backed by the CI's secret
  store, never a file committed to the repo) and that the [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) ID label
  matches what encrypted the variable if multiple [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) passwords are in
  play.

- **Symptom:** A task that installs a package works on one host group but
  fails with "package not found" on another.
  **Fix:** The role likely hardcodes a package manager module (`apt`,
  `yum`) instead of the cross-platform `package`/`dnf`/`apt` abstraction,
  or assumes a specific OS family. Use `[ansible](../ansible/SKILL.md).builtin.package` where
  behavior is uniform enough, and gate OS-specific tasks with
  `when: ansible_facts['os_family'] == "Debian"` (or the equivalent).

- **Symptom:** A large playbook run against 200 hosts fails on host #40,
  and there's no clear way to know what state the first 39 vs. remaining
  161 hosts are in.
  **Fix:** This indicates the playbook wasn't run with `serial:` batching
  or `--limit` scoping. Re-run with a smaller `--limit` slice, review
  `[ansible](../ansible/SKILL.md)-playbook ... --check --diff` output first next time, and add
  `serial:` with `max_fail_percentage` to the playbook so a systemic
  failure halts after a bounded number of hosts instead of continuing
  through the whole inventory.

## Worked example

**Scenario:** Roll out an updated nginx configuration (a new
`client_max_body_size`) to the `webservers` group in `prod`, with a
[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-encrypted TLS certificate passphrase referenced by the role, dry-run
first, then a batched rollout.

`roles/nginx/templates/nginx.conf.j2`:
```jinja
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/app.crt;
    ssl_certificate_key /etc/nginx/ssl/app.key;
    client_max_body_size {{ nginx_client_max_body_size }};
}
```

`inventories/prod/group_vars/webservers/[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).yml` (encrypted with
`[ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) create`, shown here only as the *pattern* — replace with a
real [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-managed secret, never [commit](../../CI_CD/commit/SKILL.md) plaintext):
```yaml
vault_tls_passphrase: "REPLACE_WITH_ACTUAL_SECRET"
```

`inventories/prod/group_vars/webservers/vars.yml` (plaintext, safe to
[commit](../../CI_CD/commit/SKILL.md)):
```yaml
nginx_client_max_body_size: "25m"
tls_passphrase: "{{ vault_tls_passphrase }}"
```

`playbooks/site.yml`:
```yaml
- name: Configure web tier
  hosts: webservers
  become: true
  serial: "25%"
  max_fail_percentage: 10
  roles:
    - role: nginx
```

Dry run, then batched rollout:
```bash
[ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml \
  --[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password-file /run/secrets/[ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-pass \
  --check --diff --limit webservers
# Review: 12 hosts, "changed: nginx.conf client_max_body_size 10m -> 25m",
# 0 failures.

[ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml \
  --[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password-file /run/secrets/[ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-pass
# serial: 25% => 3 hosts at a time; halts automatically if failures
# exceed 10% of the batch.
```
A follow-up idempotency check confirms convergence:
```bash
[ansible](../ansible/SKILL.md)-playbook -i inventories/prod/hosts.yml playbooks/site.yml \
  --[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password-file /run/secrets/[ansible](../ansible/SKILL.md)-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-pass
# PLAY RECAP: changed=0 across all 12 hosts.
```

## Cross-references

- [infrastructure-as-code-terraform](../../../devops/skills/[infrastructure-as-code-terraform](../[infrastructure-as-code](../infrastructure-as-code/SKILL.md)-terraform/SKILL.md)/SKILL.md)
- [aws-[cloudformation](../cloudformation/SKILL.md)-templates](../[aws-[cloudformation](../cloudformation/SKILL.md)-templates](../aws-[cloudformation](../cloudformation/SKILL.md)-templates/SKILL.md)/SKILL.md)
- [shell-scripting-best-practices](../[shell-scripting-best-practices](../../../Software_Engineering_and_Other/Languages/shell-scripting-best-practices/SKILL.md)/SKILL.md)
- [python-automation-scripting-for-ops](../[python-automation-scripting-for-ops](../../Cloud_Providers/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)-automation-scripting-for-ops/SKILL.md)/SKILL.md)
