const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');

// GET /api/test-pypi - Health check for PyPI registry
router.get('/test-pypi', auditController.getTestPypi);

// POST /api/audit - Audit requirements using MALTA scoring engine
router.post('/audit', auditController.auditRequirements);

module.exports = router;
