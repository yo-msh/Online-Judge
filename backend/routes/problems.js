const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Fetch all problems (protected route)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM problems');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
