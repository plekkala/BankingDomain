'use strict';

const request  = require('supertest');
const app      = require('../src/app');
const store    = require('../src/db/participantStore');

// Shorthand headers for different actor roles
const asAdmin  = { 'x-actor-id': 'admin-1', 'x-actor-role': 'lab-administrator' };
const asPA     = { 'x-actor-id': 'pa-1',    'x-actor-role': 'lab-participant-admin' };
const asAudit  = { 'x-actor-id': 'aud-1',   'x-actor-role': 'lab-auditor' };

beforeEach(() => store._clear());

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
describe('Authentication', () => {
  it('rejects requests without actor headers', async () => {
    const res = await request(app).get('/participants');
    expect(res.status).toBe(401);
  });

  it('rejects unknown role', async () => {
    const res = await request(app)
      .get('/participants')
      .set('x-actor-id', 'u1')
      .set('x-actor-role', 'super-admin');
    expect(res.status).toBe(401);
  });

  it('health check is unauthenticated', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// POST /participants
// ---------------------------------------------------------------------------
describe('POST /participants', () => {
  it('registers a new participant', async () => {
    const res = await request(app)
      .post('/participants')
      .set(asAdmin)
      .send({ legalName: 'Test Bank Ltd', email: 'ops@testbank.com' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.legalName).toBe('Test Bank Ltd');
    expect(res.body.status).toBe('PENDING');
    expect(res.body.apiKeys).toEqual([]);
  });

  it('rejects missing legalName', async () => {
    const res = await request(app)
      .post('/participants')
      .set(asAdmin)
      .send({ email: 'ops@testbank.com' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/participants')
      .set(asAdmin)
      .send({ legalName: 'Test Bank Ltd', email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid role', async () => {
    const res = await request(app)
      .post('/participants')
      .set(asAdmin)
      .send({ legalName: 'Test Bank Ltd', email: 'ops@testbank.com', role: 'lab-administrator' });
    expect(res.status).toBe(400);
  });

  it('rejects lab-auditor (insufficient permission)', async () => {
    const res = await request(app)
      .post('/participants')
      .set(asAudit)
      .send({ legalName: 'Test Bank Ltd', email: 'ops@testbank.com' });
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// GET /participants
// ---------------------------------------------------------------------------
describe('GET /participants', () => {
  it('lists all participants', async () => {
    await request(app)
      .post('/participants')
      .set(asAdmin)
      .send({ legalName: 'Bank A', email: 'a@bank.com' });

    const res = await request(app).get('/participants').set(asAudit);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// GET /participants/:id
// ---------------------------------------------------------------------------
describe('GET /participants/:id', () => {
  it('returns a specific participant', async () => {
    const created = (
      await request(app)
        .post('/participants')
        .set(asAdmin)
        .send({ legalName: 'Bank B', email: 'b@bank.com' })
    ).body;

    const res = await request(app)
      .get(`/participants/${created.id}`)
      .set(asAudit);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
  });

  it('returns 404 for unknown participant', async () => {
    const res = await request(app)
      .get('/participants/00000000-0000-0000-0000-000000000000')
      .set(asAudit);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid UUID', async () => {
    const res = await request(app)
      .get('/participants/not-a-uuid')
      .set(asAudit);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PUT /participants/:id/status
// ---------------------------------------------------------------------------
describe('PUT /participants/:id/status', () => {
  let participant;

  beforeEach(async () => {
    participant = (
      await request(app)
        .post('/participants')
        .set(asAdmin)
        .send({ legalName: 'Bank C', email: 'c@bank.com' })
    ).body;
  });

  it('transitions PENDING -> ACTIVE', async () => {
    const res = await request(app)
      .put(`/participants/${participant.id}/status`)
      .set(asAdmin)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACTIVE');
  });

  it('rejects invalid transition (PENDING -> SUSPENDED)', async () => {
    const res = await request(app)
      .put(`/participants/${participant.id}/status`)
      .set(asAdmin)
      .send({ status: 'SUSPENDED' });
    expect(res.status).toBe(400);
  });

  it('rejects unknown status value', async () => {
    const res = await request(app)
      .put(`/participants/${participant.id}/status`)
      .set(asAdmin)
      .send({ status: 'UNKNOWN' });
    expect(res.status).toBe(400);
  });

  it('lab-participant-admin cannot change status (needs participants:status:write)', async () => {
    const res = await request(app)
      .put(`/participants/${participant.id}/status`)
      .set(asPA)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// POST /participants/:id/keys
// ---------------------------------------------------------------------------
describe('POST /participants/:id/keys', () => {
  let participant;

  beforeEach(async () => {
    const created = (
      await request(app)
        .post('/participants')
        .set(asAdmin)
        .send({ legalName: 'Bank D', email: 'd@bank.com' })
    ).body;

    // Activate so keys can be generated
    await request(app)
      .put(`/participants/${created.id}/status`)
      .set(asAdmin)
      .send({ status: 'ACTIVE' });

    participant = (await request(app).get(`/participants/${created.id}`).set(asAdmin)).body;
  });

  it('generates an API key for an ACTIVE participant', async () => {
    const res = await request(app)
      .post(`/participants/${participant.id}/keys`)
      .set(asAdmin);
    expect(res.status).toBe(201);
    expect(res.body.apiKey).toMatch(/^rtlab_/);
    expect(res.body.participant.apiKeys).toHaveLength(1);
  });

  it('allows up to 2 keys (primary + backup)', async () => {
    await request(app).post(`/participants/${participant.id}/keys`).set(asAdmin);
    const res = await request(app)
      .post(`/participants/${participant.id}/keys`)
      .set(asAdmin);
    expect(res.status).toBe(201);
    expect(res.body.participant.apiKeys).toHaveLength(2);
  });

  it('rejects a 3rd key when limit reached', async () => {
    await request(app).post(`/participants/${participant.id}/keys`).set(asAdmin);
    await request(app).post(`/participants/${participant.id}/keys`).set(asAdmin);
    const res = await request(app)
      .post(`/participants/${participant.id}/keys`)
      .set(asAdmin);
    expect(res.status).toBe(400);
  });

  it('rejects key generation for a PENDING participant', async () => {
    const pending = (
      await request(app)
        .post('/participants')
        .set(asAdmin)
        .send({ legalName: 'Bank E', email: 'e@bank.com' })
    ).body;

    const res = await request(app)
      .post(`/participants/${pending.id}/keys`)
      .set(asAdmin);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /participants/:id/keys/:keyId
// ---------------------------------------------------------------------------
describe('DELETE /participants/:id/keys/:keyId', () => {
  let participant;
  let keyId;

  beforeEach(async () => {
    const created = (
      await request(app)
        .post('/participants')
        .set(asAdmin)
        .send({ legalName: 'Bank F', email: 'f@bank.com' })
    ).body;

    await request(app)
      .put(`/participants/${created.id}/status`)
      .set(asAdmin)
      .send({ status: 'ACTIVE' });

    const keyRes = await request(app)
      .post(`/participants/${created.id}/keys`)
      .set(asAdmin);

    participant = keyRes.body.participant;
    keyId       = participant.apiKeys[0].id;
  });

  it('revokes an API key', async () => {
    const res = await request(app)
      .delete(`/participants/${participant.id}/keys/${keyId}`)
      .set(asAdmin);
    expect(res.status).toBe(200);
    expect(res.body.apiKeys[0].revokedAt).not.toBeNull();
  });

  it('returns 400 when revoking an already-revoked key', async () => {
    await request(app)
      .delete(`/participants/${participant.id}/keys/${keyId}`)
      .set(asAdmin);
    const res = await request(app)
      .delete(`/participants/${participant.id}/keys/${keyId}`)
      .set(asAdmin);
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unknown key', async () => {
    const res = await request(app)
      .delete(`/participants/${participant.id}/keys/00000000-0000-0000-0000-000000000000`)
      .set(asAdmin);
    expect(res.status).toBe(400);
  });
});
