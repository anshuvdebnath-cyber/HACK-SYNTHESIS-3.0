// Express router mapping PyPI test, requirements.txt audit, and LaTeX manuscript audit endpoints
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auditController = require('../controllers/audit.controller');

// Configure in-memory multer storage with 5 MB file size limit
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// GET /api/test-pypi - Health check for PyPI registry
router.get('/test-pypi', auditController.getTestPypi);

// POST /api/audit-repo - Directly audit a GitHub repo's requirements.txt
router.post('/audit-repo', auditController.auditGithubRepo);
router.post('/audit-github-repo', auditController.auditGithubRepo);

// POST /api/audit - Audit requirements.txt using MALTA scoring engine
router.post('/audit', auditController.auditRequirements);

// POST /api/audit-latex - Audit GitHub repositories referenced in LaTeX manuscript (.tex)
router.post('/audit-latex', upload.single('file'), auditController.auditLatex);

// POST /api/remediation - Synthesize live AI-grounded remediation recommendations using MALTA principles
router.post('/remediation', auditController.getLiveRemediation);

module.exports = router;
