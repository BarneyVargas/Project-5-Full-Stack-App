import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function loadTasks() {
    setLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      if (!res.ok) {
        setTasks([]); // avoid tasks.map crash
        setErrMsg(data?.error || "Failed to load tasks");
        return;
      }

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setTasks([]);
      setErrMsg(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setErrMsg("");
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return setErrMsg(data?.error || "Failed to add task");

      setTitle("");
      loadTasks();
    } catch (err) {
      setErrMsg(err.message || "Network error");
    }
  }

  async function toggleTask(task) {
    setErrMsg("");
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          is_done: !task.is_done,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setErrMsg(data?.error || "Failed to update task");
      loadTasks();
    } catch (err) {
      setErrMsg(err.message || "Network error");
    }
  }

  async function editTask(task) {
    const next = prompt("New title:", task.title);
    if (next === null) return; // cancelled
    if (!next.trim()) return;

    setErrMsg("");
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next.trim(),
          is_done: task.is_done,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setErrMsg(data?.error || "Failed to edit task");
      loadTasks();
    } catch (err) {
      setErrMsg(err.message || "Network error");
    }
  }

  async function deleteTask(id) {
    setErrMsg("");
    try {
      const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return setErrMsg(data?.error || "Failed to delete task");
      loadTasks();
    } catch (err) {
      setErrMsg(err.message || "Network error");
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 rounded-2xl border p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Task Tracker</h1>
          <p className="mt-1 text-sm opacity-70">
            React + Express + Postgres (Supabase)
          </p>

          <div className="mt-4">
            <TaskForm title={title} setTitle={setTitle} onAdd={addTask} />
          </div>

          {errMsg ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
              {errMsg}
            </div>
          ) : null}

          {loading ? (
            <p className="mt-4 text-sm opacity-70">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="mt-4 text-sm opacity-70">No tasks yet.</p>
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}
