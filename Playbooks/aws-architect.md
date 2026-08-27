# AWS Architect Playbook (Mega Skill)

This playbook consolidates knowledge across several micro-skills. As an agent, you can rely on this playbook instead of querying granular skills when designing an AWS Architecture.

## Compute (`aws-ec2`)
- Always use graviton instances where possible for cost/performance.
- Ensure EC2 instances are in private subnets with NAT gateways.

## Storage (`aws-s3`)
- Block all public access at the account level.
- Enforce SSE-KMS encryption on all buckets.
- Use lifecycle policies to transition cold data to Glacier.

## Networking (`aws-vpc`)
- Distribute across at least 3 AZs.
- Use VPC Endpoints for S3 and DynamoDB to avoid NAT Gateway charges.

> Note: To learn about deep terraform implementations for these, refer to the `terraform-aws` skill.
