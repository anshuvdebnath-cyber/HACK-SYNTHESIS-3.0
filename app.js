// Express server application with startup GitHub token verification
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const auditRoutes = require('./src/routes/audit.routes');

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Base Health Route
app.get('/', (req, res) => {
    res.send('RepoVitals Backend - MALTA Analysis Engine Active');
});

// API Routes
app.use('/api', auditRoutes);

// Startup token verification to confirm GitHub rate limit quota
async function verifyGitHubToken() {
    try {
        const res = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
        });
        console.log(`✅ GitHub authenticated as: ${res.data.login}`);
        console.log(`   Rate limit: ${res.headers['x-ratelimit-limit']}/hour`);
    } catch (err) {
        console.error('❌ GitHub token INVALID or MISSING. Calls will hit 60/hour limit!');
        console.error(`   Reason: ${err.message}`);
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    verifyGitHubToken();
});
