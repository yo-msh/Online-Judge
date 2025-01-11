const express = require('express');
const { runUserCode } = require('../utils/dockerRunnerPy');
const router = express.Router();

router.post('/submit', async (req, res) => {
    const { code, input } = req.body;

    try {
        const output = await runUserCode(code, input);
        res.json({ success: true, output });
    } catch (error) {
        console.error('Error during code execution:', error);
        res.status(500).json({ success: false, error: 'Code execution failed' });
    }
});

module.exports = router;
