const express = require('express');
const roleMiddleware = require('../middleware/roleMiddleware');
const db = require('../config/db');
const router = express.Router();

// Add a new problem (Admin only)
router.post('/problems', roleMiddleware('admin'), async (req, res) => {
    const { title, description, constraints, sampleInput, sampleOutput } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO problems (title, description, constraints, sample_input, sample_output) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, constraints, sampleInput, sampleOutput]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding problem:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a problem (Admin only)
router.put('/problems/:id', roleMiddleware('admin'), async (req, res) => {
    const { id } = req.params;
    const { title, description, constraints, sampleInput, sampleOutput } = req.body;

    try {
        const result = await db.query(
            'UPDATE problems SET title = $1, description = $2, constraints = $3, sample_input = $4, sample_output = $5 WHERE id = $6 RETURNING *',
            [title, description, constraints, sampleInput, sampleOutput, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating problem:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a problem (Admin only)
router.delete('/problems/:id', roleMiddleware('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM problems WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json({ message: 'Problem deleted successfully', problem: result.rows[0] });
    } catch (error) {
        console.error('Error deleting problem:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
