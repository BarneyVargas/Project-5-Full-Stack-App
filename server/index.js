import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// health check
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// READ
app.get("/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "select * from tasks order by created_at desc"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    const { rows } = await pool.query(
      "insert into tasks (title) values ($1) returning *",
      [title]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_done } = req.body;

    const { rows } = await pool.query(
      "update tasks set title=$1, is_done=$2 where id=$3 returning *",
      [title, is_done, id]
    );

    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query("delete from tasks where id=$1", [
      id,
    ]);

    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
