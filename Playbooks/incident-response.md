# Incident Response Playbook

## 1. Triage
- Identify the impact (Severity 1 to 4).
- Open an incident channel.
- Assign an Incident Commander.

## 2. Investigation
- Check Datadog dashboards and alerts.
- Check recent deployments.
- Gather logs via `grep` or Kibana.

## 3. Mitigation
- Rollback recent deployments if correlated.
- Scale up resources if starved.
- Apply emergency patches.

## 4. Post-Mortem
- Write a blame-free root cause analysis.
- Define actionable items to prevent recurrence.
