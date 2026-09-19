const express = require('express');
const cors = require('cors');
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
