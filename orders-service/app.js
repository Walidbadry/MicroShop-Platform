const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecret";

const pool = new Pool({
  user: "postgres",
  host: "orders-db",
  database: "ordersdb",
  password: "password",
  port: 5432
});

pool.query(`CREATE TABLE IF NOT EXISTS orders(
  id SERIAL PRIMARY KEY,
  userId INT,
  product VARCHAR(255)
)`);

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(403);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

app.post("/orders", auth, async (req, res) => {
  const { product } = req.body;
  const result = await pool.query(
    "INSERT INTO orders(userId,product) VALUES($1,$2) RETURNING *",
    [req.user.id, product]
  );
  res.json(result.rows[0]);
});

app.get("/orders", auth, async (req, res) => {
  const result = await pool.query("SELECT * FROM orders WHERE userId=$1", [req.user.id]);
  res.json(result.rows);
});

app.listen(3003, () => console.log("Orders running on 3003"));
