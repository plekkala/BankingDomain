/**
 * Participant routes.
 *
 * POST   /participants                       – Register a new participant
 * GET    /participants                       – List all participants
 * GET    /participants/:id                   – Get participant by ID
 * PUT    /participants/:id/status            – Update lifecycle status
 * POST   /participants/:id/keys             – Generate an API key
 * DELETE /participants/:id/keys/:keyId      – Revoke an API key
 */

'use strict';

const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');

const { requirePermission } = require('../middleware/rbac');
const svc                   = require('../services/participantService');
const { PARTICIPANT_STATES } = require('../models/participant');

const router = Router();

/** Helper: send validation errors as 400. */
function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// POST /participants
// ---------------------------------------------------------------------------
router.post(
  '/',
  requirePermission('participants:write'),
  [
    body('legalName').isString().trim().notEmpty().withMessage('legalName is required'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('role')
      .optional()
      .isIn(['lab-participant', 'lab-participant-admin'])
      .withMessage('role must be lab-participant or lab-participant-admin'),
  ],
  (req, res) => {
    if (!validate(req, res)) return;
    try {
      const participant = svc.registerParticipant(req.body, req.user.id);
      res.status(201).json(participant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /participants
// ---------------------------------------------------------------------------
router.get(
  '/',
  requirePermission('participants:read'),
  (_req, res) => {
    res.json(svc.listParticipants());
  }
);

// ---------------------------------------------------------------------------
// GET /participants/:id
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  requirePermission('participants:read'),
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  (req, res) => {
    if (!validate(req, res)) return;
    const participant = svc.getParticipant(req.params.id);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json(participant);
  }
);

// ---------------------------------------------------------------------------
// PUT /participants/:id/status
// ---------------------------------------------------------------------------
router.put(
  '/:id/status',
  requirePermission('participants:status:write'),
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('status')
      .isIn(Object.values(PARTICIPANT_STATES))
      .withMessage(`status must be one of: ${Object.values(PARTICIPANT_STATES).join(', ')}`),
  ],
  (req, res) => {
    if (!validate(req, res)) return;
    try {
      const updated = svc.updateParticipantStatus(req.params.id, req.body.status, req.user.id);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /participants/:id/keys
// ---------------------------------------------------------------------------
router.post(
  '/:id/keys',
  requirePermission('participants:keys:write'),
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  (req, res) => {
    if (!validate(req, res)) return;
    try {
      const { participant, plaintext } = svc.generateApiKey(req.params.id, req.user.id);
      // The plaintext key is returned exactly once.
      res.status(201).json({ participant, apiKey: plaintext });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /participants/:id/keys/:keyId
// ---------------------------------------------------------------------------
router.delete(
  '/:id/keys/:keyId',
  requirePermission('participants:keys:write'),
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    param('keyId').isUUID().withMessage('keyId must be a valid UUID'),
  ],
  (req, res) => {
    if (!validate(req, res)) return;
    try {
      const updated = svc.revokeApiKey(req.params.id, req.params.keyId, req.user.id);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
