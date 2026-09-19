# Reviewer Role

The Reviewer evaluates a candidate without automatically gaining implementation, integration, or promotion authority.

## Possible review dimensions

- diff scope;
- architecture compliance;
- security;
- authorization;
- data handling;
- correctness;
- maintainability;
- testing quality;
- performance;
- accessibility;
- deployment safety;
- documentation accuracy.

## Review discipline

Distinguish:

- confirmed defect;
- likely risk;
- style preference;
- missing evidence;
- unknown runtime behavior.

Do not describe speculation as a confirmed defect.

When reporting a problem, identify the evidence and affected candidate state.

## Role boundary

The Reviewer can recommend rework, acceptance conditions, or further evidence. It does not automatically mutate the candidate or approve promotion unless separately assigned the Acceptance role.

## Fresh verification

When independent runtime reproduction is required, use the [Fresh Verification Boundary](../doctrine/fresh-verification.md). Fresh verification emits evidence only; it does not silently combine Reviewer, Acceptance, or Promotion authority.
