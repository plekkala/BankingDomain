# Feature 01: Participant Onboarding & API Access Management

## Source requirements
- `Technicalrequirements.md` section 3.1.2 (Participant Management Service)
- `Technicalrequirements.md` section 8.1 (Authentication & Authorization)
- `Technicalrequirements.md` section 13.1 (Onboarding Process)

## Goal
Enable Synchronisation Lab participants to be onboarded and securely access APIs.

## Scope
### In scope
- Participant registration workflow
- API key generation and rotation
- OAuth2/OIDC based authentication
- Role/permission model for participant access

### Out of scope
- Billing and invoicing
- UI implementation details

## Initial development plan
- [x] Define feature scope from technical requirements
- [ ] Define participant domain model and states
- [ ] Draft onboarding API contracts (`POST /participants`, `POST /participants/{id}/keys`)
- [ ] Define RBAC roles and permissions matrix
- [ ] Define initial audit events for onboarding actions
