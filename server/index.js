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

// quick health check
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// READ all tasks
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

// CREATE task
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const { rows } = await pool.query(
      "insert into tasks (title) values ($1) returning *",
      [title.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE title
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // You can update either title or is_done (or both)
    const { title, is_done } = req.body;

    // Build dynamic update safely
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: "title cannot be empty" });
      }
      fields.push(`title=$${idx++}`);
      values.push(title.trim());
    }

    if (is_done !== undefined) {
      fields.push(`is_done=$${idx++}`);
      values.push(Boolean(is_done));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "nothing to update" });
    }

    values.push(id);

    const { rows, rowCount } = await pool.query(
      `update tasks set ${fields.join(", ")} where id=$${idx} returning *`,
      values
    );

    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
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
