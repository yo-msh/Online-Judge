// authController.js
const pool = require("../config/db"); // Ensure this connects to PostgreSQL
const bcrypt = require("bcrypt");

// Register a new user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const userExists = await pool.query(userExistsQuery, [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertUserQuery =
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *";
    const newUser = await pool.query(insertUserQuery, [email, hashedPassword]);

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
