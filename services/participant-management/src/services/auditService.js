/**
 * Audit logging service.
 *
 * Emits structured log entries for every significant onboarding action.
 * In production these would be published to an event stream (e.g. Kafka).
 */

'use strict';

const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

/** Known audit event types for the onboarding domain. */
const AUDIT_EVENTS = Object.freeze({
  PARTICIPANT_REGISTERED:     'PARTICIPANT_REGISTERED',
  PARTICIPANT_STATUS_CHANGED: 'PARTICIPANT_STATUS_CHANGED',
  API_KEY_GENERATED:          'API_KEY_GENERATED',
  API_KEY_REVOKED:            'API_KEY_REVOKED',
});

/**
 * Record an audit event.
 *
 * @param {string} eventType  - One of AUDIT_EVENTS
 * @param {string} actorId    - ID of the user/service that triggered the action
 * @param {object} payload    - Contextual data (no secrets)
 */
function record(eventType, actorId, payload = {}) {
  logger.info({
    audit:     true,
    eventType,
    actorId,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

module.exports = { AUDIT_EVENTS, record };
