const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecret";

const pool = new Pool({
  user: "postgres",
  host: "users-db",
  database: "usersdb",
  password: "password",
  port: 5432
});

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user'
  )`);
  const admin = await pool.query("SELECT * FROM users WHERE email='admin@test.com'");
  if (admin.rows.length === 0) {
    const hashed = await bcrypt.hash("123456", 10);
    await pool.query("INSERT INTO users(email,password,role) VALUES($1,$2,$3)",
      ["admin@test.com", hashed, "admin"]);
    console.log("Admin seeded");
  }
}
init();

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users(email,password) VALUES($1,$2) RETURNING id,email",
      [email, hashed]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(400).json({ error: "User exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (result.rows.length === 0) return res.sendStatus(401);
  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.sendStatus(401);
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.listen(3001, () => console.log("Users running on 3001"));
