/**
 * Authentication middleware (stub).
 *
 * In production this verifies a JWT issued by Keycloak / AWS Cognito,
 * checks the audience claim, and enforces a 15-minute token expiry.
 *
 * For local development / tests the caller passes an x-actor-id header
 * and an x-actor-role header so the service can be exercised without a
 * live identity provider.
 */

'use strict';

const VALID_ROLES = new Set([
  'lab-participant',
  'lab-participant-admin',
  'lab-administrator',
  'lab-auditor',
]);

/**
 * Populate req.user from incoming headers.
 * A real implementation would validate the Authorization: Bearer <JWT>.
 */
function authenticate(req, res, next) {
  const actorId   = req.headers['x-actor-id'];
  const actorRole = req.headers['x-actor-role'];

  if (!actorId || !actorRole) {
    return res.status(401).json({ error: 'Missing x-actor-id or x-actor-role header' });
  }

  if (!VALID_ROLES.has(actorRole)) {
    return res.status(401).json({ error: `Unknown role: ${actorRole}` });
  }

  req.user = { id: actorId, role: actorRole };
  next();
}

module.exports = { authenticate };
