/**
 * In-memory store for participants.
 *
 * In production this would be backed by PostgreSQL; the interface is designed
 * so it can be swapped without touching the service or route layers.
 */

'use strict';

/** @type {Map<string, object>} */
const participants = new Map();

const store = {
  /**
   * Persist a new participant.
   * @param {object} participant
   * @returns {object} The stored participant
   */
  save(participant) {
    participants.set(participant.id, { ...participant });
    return this.findById(participant.id);
  },

  /**
   * Look up a participant by ID.
   * @param {string} id
   * @returns {object|null}
   */
  findById(id) {
    const p = participants.get(id);
    return p ? { ...p, apiKeys: [...p.apiKeys] } : null;
  },

  /**
   * Return all participants.
   * @returns {object[]}
   */
  findAll() {
    return Array.from(participants.values()).map((p) => ({
      ...p,
      apiKeys: [...p.apiKeys],
    }));
  },

  /**
   * Replace an existing participant record.
   * @param {object} participant
   * @returns {object} Updated record
   */
  update(participant) {
    if (!participants.has(participant.id)) return null;
    participants.set(participant.id, { ...participant });
    return this.findById(participant.id);
  },

  /** Clear all records (test helper). */
  _clear() {
    participants.clear();
  },
};

module.exports = store;
