/**
 * API Key service.
 *
 * Generates, rotates and revokes cryptographically random API keys.
 * Keys are stored as a prefix + SHA-256 hash; only the plaintext is
 * returned once at creation time.
 */

'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const KEY_PREFIX  = 'rtlab_';
const KEY_BYTES   = 32; // 256 bits of entropy
const MAX_KEYS    = 2;  // primary + backup as per requirements

/**
 * Generate a new API key pair.
 *
 * @returns {{ id, prefix, hashedKey, plaintext, createdAt }}
 *   `plaintext` must be returned to the caller exactly once and never stored.
 */
function generateKey() {
  const raw       = crypto.randomBytes(KEY_BYTES).toString('hex');
  const plaintext = `${KEY_PREFIX}${raw}`;
  const hashedKey = crypto.createHash('sha256').update(plaintext).digest('hex');
  return {
    id:         uuidv4(),
    prefix:     `${KEY_PREFIX}${raw.slice(0, 8)}`,
    hashedKey,
    plaintext,  // caller must not persist this
    createdAt:  new Date().toISOString(),
    revokedAt:  null,
  };
}

/**
 * Verify a plaintext API key against a stored hash.
 *
 * @param {string} plaintext
 * @param {string} hashedKey
 * @returns {boolean}
 */
function verifyKey(plaintext, hashedKey) {
  const expected = crypto.createHash('sha256').update(plaintext).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(hashedKey, 'hex')
  );
}

/**
 * Add a new key to a participant's key list (max MAX_KEYS active keys).
 *
 * @param {object} participant - Participant record (mutated)
 * @returns {{ key: object, plaintext: string }}
 * @throws {Error} if the active key limit is reached
 */
function addKey(participant) {
  const activeKeys = participant.apiKeys.filter((k) => !k.revokedAt);
  if (activeKeys.length >= MAX_KEYS) {
    throw new Error(
      `Maximum of ${MAX_KEYS} active API keys already reached. Revoke one before generating a new key.`
    );
  }
  const { plaintext, ...storedKey } = generateKey();
  participant.apiKeys.push(storedKey);
  participant.updatedAt = new Date().toISOString();
  return { key: storedKey, plaintext };
}

/**
 * Revoke a key by ID on the participant record (mutated).
 *
 * @param {object} participant
 * @param {string} keyId
 * @throws {Error} if key not found or already revoked
 */
function revokeKey(participant, keyId) {
  const key = participant.apiKeys.find((k) => k.id === keyId);
  if (!key) throw new Error(`API key '${keyId}' not found`);
  if (key.revokedAt) throw new Error(`API key '${keyId}' is already revoked`);
  key.revokedAt     = new Date().toISOString();
  participant.updatedAt = new Date().toISOString();
}

module.exports = { addKey, revokeKey, verifyKey, MAX_KEYS };
