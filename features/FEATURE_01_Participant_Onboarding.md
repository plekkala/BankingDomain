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
- [x] Define participant domain model and states
- [x] Draft onboarding API contracts (`POST /participants`, `POST /participants/{id}/keys`)
- [x] Define RBAC roles and permissions matrix
- [x] Define initial audit events for onboarding actions

## Implementation

The service is implemented at `services/participant-management/`.

### Domain model (`src/models/participant.js`)

| State      | Description                            | Allowed transitions         |
|------------|----------------------------------------|-----------------------------|
| PENDING    | Application submitted, awaiting KYC   | → ACTIVE, REVOKED           |
| ACTIVE     | Fully onboarded, API access enabled   | → SUSPENDED, REVOKED        |
| SUSPENDED  | Temporarily blocked by admin           | → ACTIVE, REVOKED           |
| REVOKED    | Permanently removed (terminal state)  | —                           |

### API contracts

| Method | Path                                  | Permission required              | Description                   |
|--------|---------------------------------------|----------------------------------|-------------------------------|
| POST   | `/participants`                       | `participants:write`             | Register a new participant    |
| GET    | `/participants`                       | `participants:read`              | List all participants         |
| GET    | `/participants/:id`                   | `participants:read`              | Get a single participant      |
| PUT    | `/participants/:id/status`            | `participants:status:write`      | Transition lifecycle status   |
| POST   | `/participants/:id/keys`             | `participants:keys:write`        | Generate an API key           |
| DELETE | `/participants/:id/keys/:keyId`      | `participants:keys:write`        | Revoke an API key             |

### RBAC roles and permissions matrix

| Role                    | `participants:read` | `participants:write` | `participants:keys:write` | `participants:status:write` |
|-------------------------|:-------------------:|:--------------------:|:-------------------------:|:---------------------------:|
| lab-participant         |    own only         |                      |                           |                             |
| lab-participant-admin   | ✓                   | ✓                    | ✓                         |                             |
| lab-administrator       | ✓                   | ✓                    | ✓                         | ✓                           |
| lab-auditor             | ✓                   |                      |                           |                             |

### Audit events

| Event                        | Trigger                                |
|------------------------------|----------------------------------------|
| `PARTICIPANT_REGISTERED`     | New participant registered             |
| `PARTICIPANT_STATUS_CHANGED` | Participant lifecycle status updated   |
| `API_KEY_GENERATED`          | New API key issued                     |
| `API_KEY_REVOKED`            | API key revoked                        |
