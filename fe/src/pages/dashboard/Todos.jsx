import { useEffect, useState } from "react";
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "../../api/todo.api";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
  setLoading(true);
  try {
    const res = await getTodos();

    const list = Array.isArray(res.data.data)
      ? res.data.data
      : res.data.data?.todos || [];

    setTodos(list);
  } catch (err) {
    console.error("Failed to load todos", err);
    setTodos([]);
  } finally {
    setLoading(false);
  }
};


  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await createTodo({ title });
      setTodos([res.data.data, ...todos]); 
      setTitle("");
    } catch (err) {
      console.error("Create todo failed", err);
    }
  };

  const handleToggle = async (todo) => {
    try {
      const res = await updateTodo(todo._id, {
        completed: !todo.completed,
      });

      setTodos(
        todos.map((t) => (t._id === todo._id ? res.data.data : t))
      );
    } catch (err) {
      console.error("Update todo failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this todo?")) return;

    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete todo failed", err);
    }
  };

  return (
    <div>
      <h1 className="page-title">Todos</h1>

      <form onSubmit={handleCreate} className="card">
        <input
          placeholder="New todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        todos.map((todo) => (
          <div key={todo._id} className="card">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo)}
            />
            <span style={{ marginLeft: 8 }}>
              {todo.title}
            </span>
            <button onClick={() => handleDelete(todo._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
