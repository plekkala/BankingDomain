/**
 * Participant service.
 *
 * Orchestrates participant lifecycle business logic, delegating persistence
 * to the store and side-effects (audit) to the audit service.
 */

'use strict';

const { createParticipant, applyStatusTransition } = require('../models/participant');
const store        = require('../db/participantStore');
const { addKey, revokeKey }  = require('./keyService');
const audit        = require('./auditService');

/**
 * Register a new participant (Phase 1 of onboarding).
 *
 * @param {object} data   - { legalName, email, role? }
 * @param {string} actorId
 * @returns {object} Persisted participant record
 */
function registerParticipant(data, actorId) {
  const participant = createParticipant(data);
  const saved       = store.save(participant);
  audit.record(audit.AUDIT_EVENTS.PARTICIPANT_REGISTERED, actorId, {
    participantId: saved.id,
    legalName:     saved.legalName,
    role:          saved.role,
  });
  return saved;
}

/**
 * Retrieve a single participant.
 *
 * @param {string} id
 * @returns {object|null}
 */
function getParticipant(id) {
  return store.findById(id);
}

/**
 * List all participants.
 *
 * @returns {object[]}
 */
function listParticipants() {
  return store.findAll();
}

/**
 * Transition a participant to a new lifecycle status.
 *
 * @param {string} id       - Participant ID
 * @param {string} status   - Target PARTICIPANT_STATES value
 * @param {string} actorId
 * @returns {object} Updated participant record
 * @throws {Error} if participant not found or transition invalid
 */
function updateParticipantStatus(id, status, actorId) {
  const participant = store.findById(id);
  if (!participant) throw new Error(`Participant '${id}' not found`);

  const previousStatus = participant.status;
  applyStatusTransition(participant, status);
  const updated = store.update(participant);

  audit.record(audit.AUDIT_EVENTS.PARTICIPANT_STATUS_CHANGED, actorId, {
    participantId:  id,
    previousStatus,
    newStatus:      status,
  });

  return updated;
}

/**
 * Generate a new API key for an ACTIVE participant (Phase 2 of onboarding).
 *
 * @param {string} id       - Participant ID
 * @param {string} actorId
 * @returns {{ participant: object, plaintext: string }}
 * @throws {Error} if participant not found or not ACTIVE
 */
function generateApiKey(id, actorId) {
  const participant = store.findById(id);
  if (!participant) throw new Error(`Participant '${id}' not found`);
  if (participant.status !== 'ACTIVE') {
    throw new Error(
      `API keys can only be generated for ACTIVE participants (current status: ${participant.status})`
    );
  }

  const { key, plaintext } = addKey(participant);
  const updated = store.update(participant);

  audit.record(audit.AUDIT_EVENTS.API_KEY_GENERATED, actorId, {
    participantId: id,
    keyId:         key.id,
    keyPrefix:     key.prefix,
  });

  return { participant: updated, plaintext };
}

/**
 * Revoke a specific API key.
 *
 * @param {string} participantId
 * @param {string} keyId
 * @param {string} actorId
 * @returns {object} Updated participant record
 */
function revokeApiKey(participantId, keyId, actorId) {
  const participant = store.findById(participantId);
  if (!participant) throw new Error(`Participant '${participantId}' not found`);

  revokeKey(participant, keyId);
  const updated = store.update(participant);

  audit.record(audit.AUDIT_EVENTS.API_KEY_REVOKED, actorId, {
    participantId,
    keyId,
  });

  return updated;
}

module.exports = {
  registerParticipant,
  getParticipant,
  listParticipants,
  updateParticipantStatus,
  generateApiKey,
  revokeApiKey,
};
