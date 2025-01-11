// directory path: backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const submissionRoutes = require("./routes/submissions");
const codeExecutionRoutes = require("./routes/codeExecution");
const { runUserCodePy } = require("./utils/dockerRunnerPy");
const { runUserCodeCpp } = require("./utils/dockerRunnerCpp");
const { runUserCodeJava } = require("./utils/dockerRunnerJava");
const { runUserCodeJs } = require("./utils/dockerRunnerJs");
// const { runUserCodeJavaJs } = require("./utils/dockerRunnerJavaJs");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/submissions", submissionRoutes);
app.use("/code", codeExecutionRoutes);

// Routes
app.get("/", (req, res) => {
	res.send("Welcome to the Online Coding Platform Backend!");
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

const db = require("./config/db");

app.get("/test-db", async (req, res) => {
	try {
		const result = await db.query("SELECT NOW()");
		res.json({ message: "Database connected!", time: result.rows[0] });
	} catch (error) {
		console.error("Database test error:", error);
		res.status(500).json({ error: "Database connection failed" });
	}
});

app.post("/users", async (req, res) => {
	const { name, email, password, role } = req.body;

	try {
		const result = await db.query(
			"INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
			[name, email, password, role || "user"],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error inserting user:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.get("/users", async (req, res) => {
	try {
		const result = await db.query(
			"SELECT id, name, email, role, created_at FROM users",
		);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create a new problem
app.post("/problems", async (req, res) => {
	const {
		title,
		description,
		constraints,
		sampleInput,
		sampleOutput,
		testCases,
	} = req.body;

	try {
		const result = await db.query(
			"INSERT INTO problems (title, description, constraints, sample_input, sample_output) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[title, description, constraints, sampleInput, sampleOutput],
		);

		if (testCases && testCases.length > 0) {
			for (const test of testCases) {
				await db.query(
					"INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)",
					[result.rows[0].id, test.input, test.expectedOutput, test.isHidden],
				);
			}
		}
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error inserting problem:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all problems
app.get("/problems", async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM problems");
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching problems:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get a single problem
app.get("/problems/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const result = await db.query("SELECT * FROM problems WHERE id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Problem not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching problem:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// running all test cases for a problem
app.post("/execute/:problemId", async (req, res) => {
	const { problemId } = req.params;
	const { code, language } = req.body;

	try {
		// Fetch problem and its test cases
		const problem = await db.query("SELECT * FROM problems WHERE id = $1", [
			problemId,
		]);

		const testCases = await db.query(
			"SELECT * FROM test_cases WHERE problem_id = $1",
			[problemId],
		);

		if (problem.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: "Problem not found",
			});
		}

		// Run code against each test case
		const results = [];
		for (const test of testCases.rows) {
			let output;
			switch (language.toLowerCase()) {
				case "python":
					output = await runUserCodePy(code, test.input);
					break;
				case "cpp":
					output = await runUserCodeCpp(code, test.input);
					break;
				case "java":
					output = await runUserCodeJava(code, test.input);
					break;
				case "javascript":
					output = await runUserCodeJs(code, test.input);
					break;
				default:
					return res.status(400).json({
						success: false,
						error: `Unsupported language: ${language}`,
					});
			}

			// Compare output with expected output
			const passed = output.trim() === test.expected_output.trim();
			results.push({
				input: test.input,
				expectedOutput: test.is_hidden ? "Hidden" : test.expected_output,
				actualOutput: output,
				passed,
			});
		}

		// Calculate overall result
		const allPassed = results.every((r) => r.passed);

		return res.json({
			success: true,
			results,
			allPassed,
			totalTests: results.length,
			passedTests: results.filter((r) => r.passed).length,
		});
	} catch (error) {
		console.error("Error executing code:", error);
		return res.status(500).json({
			success: false,
			error: error.toString(),
		});
	}
});

//wrapper for code execution
app.post("/execute", async (req, res) => {
	const { code, input, language } = req.body;
	if (!code || !language) {
		return res
			.status(400)
			.json({ success: false, error: "Code and language are required." });
	}

	try {
		let output;
		switch (language.toLowerCase()) {
			case "python":
				output = await runUserCodePy(code, input);
				break;
			case "cpp":
				output = await runUserCodeCpp(code, input);
				break;
			case "java":
				output = await runUserCodeJava(code, input);
				break;
			case "javascript":
				output = await runUserCodeJs(code, input);
				break;
			default:
				return res.status(400).json({
					success: false,
					error: `Unsupported language: ${language}`,
				});
		}

		return res.json({ success: true, output });
	} catch (error) {
		console.error("Error executing code:", error);
		return res.status(500).json({ success: false, error: error.toString() });
	}
});

// API Endpoint to execute user code

// app.post("/execute", async (req, res) => {
// 	const { code, language, problemId } = req.body;

// 	try {
// 		// Fetch test cases for the problem
// 		const testCases = await db.query(
// 			"SELECT input, expected_output FROM test_cases WHERE problem_id = $1",
// 			[problemId],
// 		);

// 		const results = [];
// 		for (const test of testCases.rows) {
// 			let output;
// 			switch (language.toLowerCase()) {
// 				case "python":
// 					output = await runUserCodePy(code, test.input);
// 					break;
// 				case "cpp":
// 					output = await runUserCodeCpp(code, test.input);
// 					break;
// 				case "java":
// 					output = await runUserCodeJava(code, test.input);
// 					break;
// 				case "javascript":
// 					output = await runUserCodeJs(code, test.input);
// 					break;
// 				default:
// 					return res.status(400).json({
// 						success: false,
// 						error: `Unsupported language: ${language}`,
// 					});
// 			}

// 			results.push({
// 				passed: output.trim() === test.expected_output.trim(),
// 				input: test.input,
// 				expected: test.expected_output,
// 				actual: output,
// 			});
// 		}

// 		return res.json({
// 			success: true,
// 			results,
// 			passedCount: results.filter((r) => r.passed).length,
// 			totalTests: results.length,
// 		});
// 	} catch (error) {
// 		console.error("Error executing code:", error);
// 		return res.status(500).json({ success: false, error: error.toString() });
// 	}
// });

// // API Endpoint to execute user code
// app.post("/execute/py", async (req, res) => {
//   const { code, input } = req.body;

//   // Validate user input
//   if (!code) {
//     return res.status(400).json({ success: false, error: "Code is required." });
//   }

//   try {
//     const output = await runUserCodePy(code, input);
//     return res.json({ success: true, output });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// });

// // API Endpoint to execute user code in C++
// app.post("/execute/cpp", async (req, res) => {
//   const { code, input } = req.body;

//   if (!code) {
//     return res.status(400).json({ success: false, error: "Code is required." });
//   }

//   try {
//     const output = await runUserCodeCpp(code, input);
//     return res.json({ success: true, output });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// });

// // API Endpoint for Java
// app.post("/execute/java", async (req, res) => {
//   const { code, input } = req.body;

//   if (!code) {
//     return res.status(400).json({ success: false, error: "Code is required." });
//   }

//   try {
//     const output = await runUserCodeJava(code, input);
//     return res.json({ success: true, output });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// });

// // API Endpoint for Java
// app.post("/execute/java", async (req, res) => {
//   const { code, input } = req.body;

//   if (!code) {
//     return res.status(400).json({ success: false, error: "Code is required." });
//   }

//   try {
//     const output = await runUserCodeJava(code, input);
//     return res.json({ success: true, output });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// });

// // API Endpoint for JavaScript
// app.post("/execute/javascript", async (req, res) => {
//   const { code, input } = req.body;

//   if (!code) {
//     return res.status(400).json({ success: false, error: "Code is required." });
//   }

//   try {
//     const output = await runUserCodeJs(code, input);
//     return res.json({ success: true, output });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// });

// // THIS IS NOT WORKING SO I HAVE MADE A NEW FILE FOR JAVA AND JS SEPARATELY
// // API Endpoint to execute user code in Java/JavaScript
// app.post("/execute/java-js", async (req, res) => {
//   const { code, input } = req.body;

//   if (!code) {
//     return res.status(400).json({ success: false, error: "Code is required." });
//   }

//   try {
//     const output = await runUserCodeJavaJs(code, input);
//     return res.json({ success: true, output });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// });
