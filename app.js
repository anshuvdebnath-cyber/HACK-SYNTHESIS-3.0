const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware: Enable CORS for frontend integration and JSON request body parsing
app.use(cors());
app.use(express.json());

// Health Check / Base Route
app.get('/', (req, res) => {
    res.send('RepoVitals Backend - MALTA Analysis Engine Active');
});

// Base Test Route: Verify outbound PyPI connectivity
app.get('/api/test-pypi', async (req, res) => {
    try {
        const response = await axios.get('https://pypi.org/pypi/numpy/json', { timeout: 8000 });
        res.json({
            status: 'online',
            package: response.data.info.name,
            latestVersion: response.data.info.version,
            summary: response.data.info.summary
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
