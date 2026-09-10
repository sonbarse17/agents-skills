#!/bin/sh
# Dissolves Global_References/ by moving each category's flat reference dump
# into a references/ subfolder inside that category's real tree. The prior
# round already clustered files by which category's skills reference them
# (see reorganize-global-references.js) - this just removes the extra
# wrapper folder now that clustering is done and 99% of refs are single-
# category (see repo-wide cross-reference analysis in conversation).
set -e
cd "$(dirname "$0")/../.."

git mv Global_References/AI_and_Agents AI_and_Agents/references
git mv Global_References/Data_Engineering Data_Engineering/references
git mv Global_References/Mobile Mobile/references
git mv Global_References/Product_and_Business Product_and_Business/references
git mv Global_References/Security Security/references
git mv Global_References/Software_Engineering_and_Other Software_Engineering_and_Other/references
git mv Global_References/ci-cd DevOps_and_Cloud/ci-cd/references
git mv Global_References/cloud DevOps_and_Cloud/cloud/references
git mv Global_References/containers-orchestration DevOps_and_Cloud/containers-orchestration/references
git mv Global_References/infrastructure-as-code DevOps_and_Cloud/infrastructure-as-code/references
git mv Global_References/observability-monitoring-logging DevOps_and_Cloud/observability-monitoring-logging/references

# Orphaned: Blockchain_and_Web3 category was deleted earlier this session;
# nothing in the repo links to these anymore (verified).
git rm -q -r -f Global_References/Blockchain_and_Web3

rmdir Global_References 2>/dev/null || true

echo "Done."
