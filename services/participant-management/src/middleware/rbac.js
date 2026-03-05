/**
 * RBAC middleware.
 *
 * Roles (from Technicalrequirements.md §8.1):
 *   lab-participant        – basic transaction operations
 *   lab-participant-admin  – full participant operations + configuration
 *   lab-administrator      – platform management
 *   lab-auditor            – read-only audit access
 *
 * In production the JWT would be validated against Keycloak / AWS Cognito.
 * This implementation reads a pre-verified role claim from req.user (set by
 * the upstream authentication middleware).
 */

'use strict';

/** All platform roles and the API permissions each one grants. */
const ROLES = Object.freeze({
  'lab-participant':        ['participants:read:own'],
  'lab-participant-admin':  ['participants:read', 'participants:write', 'participants:keys:write'],
  'lab-administrator':      ['participants:read', 'participants:write', 'participants:keys:write', 'participants:status:write'],
  'lab-auditor':            ['participants:read'],
});

/**
 * Express middleware factory.
 *
 * @param {...string} requiredPermissions - At least one must be held by the caller
 * @returns {Function} Express middleware
 */
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = ROLES[user.role] || [];
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: `Forbidden: requires one of [${requiredPermissions.join(', ')}]`,
      });
    }

    next();
  };
}

module.exports = { ROLES, requirePermission };
