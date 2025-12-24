import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    setError("");
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load tasks");
      }

      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setTasks([]);
      setError(e.message);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to add task");

      setTitle("");
      await loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_done: !task.is_done }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to update task");

      await loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function updateTitle(task, newTitle) {
    setError("");
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to rename task");

      await loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteTask(id) {
    setError("");
    try {
      const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to delete task");

      await loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div
      style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>Task Tracker</h1>

      {error && (
        <p style={{ color: "crimson", background: "#ffe6e6", padding: 10 }}>
          {error}
        </p>
      )}

      <form onSubmit={addTask} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          style={{ flex: 1, padding: 10 }}
        />
        <button style={{ padding: "10px 14px" }}>Add</button>
      </form>

      <ul style={{ marginTop: 20, paddingLeft: 18 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={t.is_done}
              onChange={() => toggleTask(t)}
              style={{ marginRight: 8 }}
            />
            <span style={{ marginRight: 10 }}>{t.title}</span>
            <button onClick={() => deleteTask(t.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
