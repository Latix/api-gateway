const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const SECRET_KEY = 'your_secret_key';
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Example route: User service
app.use('/probe', async (req, res) => {
    console.log("Entered >>>");
    try {
        const response = await axios({
            method: req.method,
            url: `http://127.0.0.1:3000${req.path}`, // Forward to User service
            data: req.body,
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send(error.message);
    }
});

// Example route: Order service
app.use('/order', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `http://localhost:5000${req.path}`, // Forward to Order service
            data: req.body,
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send(error.message);
    }
});

// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied');

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Invalid token');
    }
};

// Apply middleware
app.use('/secure', authenticate, (req, res) => {
    res.send('This is a secure route');
});

// Apply rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
});

app.use('/api', limiter);

app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
});