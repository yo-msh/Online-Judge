const express = require("express");
const { runCodeInDocker } = require("../utils/dockerRunnerPy");
const db = require("../config/db");
const router = express.Router();

router.post("/submit", async (req, res) => {
  const { code, language, problemId, userId } = req.body;

  try {
    // Fetch test cases for the problem
    const result = await db.query(
      "SELECT input, expected_output FROM test_cases WHERE problem_id = $1",
      [problemId]
    );

    const testCases = result.rows;
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      const userOutput = await runCodeInDocker(language, code, testCase.input);
      const passed = userOutput === testCase.expected_output;
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        userOutput,
        passed,
      });
      if (!passed) {
        allPassed = false;
      }
    }

    // 3) Determine final status
    const status = allPassed ? "Accepted" : "Wrong Answer";

    // 4) Insert submission record
    const submissionInsert = await db.query(
      `INSERT INTO submissions (user_id, problem_id, code, language, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, problemId, code, language, status]
    );

    res.json({
      success: true,
      submission: submissionInsert.rows[0],
      results,
    });
  } catch (error) {
    console.error("Error during submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
