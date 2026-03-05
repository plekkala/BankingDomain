/**
 * Participant domain model.
 *
 * Represents a Lab participant and encapsulates all allowed state transitions.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/** All valid lifecycle states for a participant. */
const PARTICIPANT_STATES = Object.freeze({
  PENDING:    'PENDING',    // Application submitted, awaiting KYC/AML
  ACTIVE:     'ACTIVE',     // Fully onboarded, can access APIs
  SUSPENDED:  'SUSPENDED',  // Temporarily blocked by admin
  REVOKED:    'REVOKED',    // Permanently removed
});

/** Allowed state transitions: currentState -> Set of reachable states */
const ALLOWED_TRANSITIONS = Object.freeze({
  [PARTICIPANT_STATES.PENDING]:   new Set([PARTICIPANT_STATES.ACTIVE, PARTICIPANT_STATES.REVOKED]),
  [PARTICIPANT_STATES.ACTIVE]:    new Set([PARTICIPANT_STATES.SUSPENDED, PARTICIPANT_STATES.REVOKED]),
  [PARTICIPANT_STATES.SUSPENDED]: new Set([PARTICIPANT_STATES.ACTIVE, PARTICIPANT_STATES.REVOKED]),
  [PARTICIPANT_STATES.REVOKED]:   new Set(), // terminal
});

/**
 * Factory: create a new participant record.
 *
 * @param {object} data
 * @param {string} data.legalName  - Full legal name of the institution
 * @param {string} data.email      - Primary contact email
 * @param {string} data.role       - Initial RBAC role (defaults to lab-participant)
 * @returns {object} Participant record
 */
function createParticipant({ legalName, email, role = 'lab-participant' }) {
  const now = new Date().toISOString();
  return {
    id:         uuidv4(),
    legalName,
    email,
    role,
    status:     PARTICIPANT_STATES.PENDING,
    apiKeys:    [],
    createdAt:  now,
    updatedAt:  now,
  };
}

/**
 * Validate and apply a status transition in place.
 *
 * @param {object} participant - Participant record (mutated)
 * @param {string} newStatus   - Target state
 * @throws {Error} if the transition is not allowed
 */
function applyStatusTransition(participant, newStatus) {
  if (!PARTICIPANT_STATES[newStatus]) {
    throw new Error(`Unknown status: ${newStatus}`);
  }
  const allowed = ALLOWED_TRANSITIONS[participant.status];
  if (!allowed || !allowed.has(newStatus)) {
    throw new Error(
      `Transition from '${participant.status}' to '${newStatus}' is not allowed`
    );
  }
  participant.status    = newStatus;
  participant.updatedAt = new Date().toISOString();
}

module.exports = { PARTICIPANT_STATES, createParticipant, applyStatusTransition };
