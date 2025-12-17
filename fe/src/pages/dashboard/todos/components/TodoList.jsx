export default function TodoList({ todos, busyId, onToggle, onRemove }) {
  if (!Array.isArray(todos) || todos.length === 0) {
    return <div className="card muted">No todos found</div>;
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => {
        const isDone = todo.status === "completed" || todo.completed === true;

        return (
          <div key={todo._id} className={`card todo-item ${isDone ? "done" : ""}`}>
            <label className="todo-left">
              <input
                type="checkbox"
                checked={isDone}
                disabled={busyId === todo._id}
                onChange={() => onToggle(todo)}
              />
              <span className={`todo-title ${isDone ? "done" : ""}`}>
                {todo.content}
              </span>
              <span className={`todo-badge ${isDone ? "done" : "pending"}`}>
                {isDone ? "Done" : "Pending"}
              </span>
            </label>
            <button className="btn btn-danger" disabled={busyId === todo._id} onClick={() => onRemove(todo._id)}>
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}