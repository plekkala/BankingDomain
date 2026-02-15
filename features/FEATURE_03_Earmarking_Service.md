# Feature 03: Fund Earmarking Service

## Source requirements
- `Technicalrequirements.md` section 3.1.1 (Earmarking Service)
- `Technicalrequirements.md` section 7.1 and 7.2 (Synchronisation Models)
- `Technicalrequirements.md` section 6.2 (Core API Endpoints)

## Goal
Reserve and release funds safely before final settlement.

## Scope
### In scope
- Earmark funds operation
- Release funds operation
- Earmark expiry handling
- Earmarking event publishing

### Out of scope
- Final settlement execution
- End-of-day reconciliation

## Initial development plan
- [x] Define feature scope from technical requirements
- [ ] Define earmark lifecycle state machine
- [ ] Draft API contracts (`POST /transactions/{id}/earmark`, `POST /transactions/{id}/release`)
- [ ] Define concurrency control strategy (optimistic locking)
- [ ] Define events (`FundsEarmarked`, `FundsReleased`, `EarmarkingExpired`)
