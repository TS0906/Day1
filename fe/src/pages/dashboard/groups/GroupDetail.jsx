import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroupById } from "../../../api/group.api";
import { getTodosByGroup, createGroupTodo, updateTodo } from "../../../api/todo.api"; // Import các API mới
import InviteMember from "./invitations/InviteMember";
import "./group.css";

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupRes, todoRes] = await Promise.all([
        getGroupById(groupId),
        getTodosByGroup(groupId)
      ]);

      if (groupRes.data?.success) {
        setGroup(groupRes.data.data);
      }
      if (todoRes.data?.success) {
        setTodos(todoRes.data.data);
      }
    } catch (err) {
      console.error("Failed loading group detail.", err);
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchData();
  }, [groupId]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await createGroupTodo(groupId, { content: newTodo });
      if (res.data?.success) {
        setTodos([res.data.data, ...todos]);
        setNewTodo(""); 
      }
    } catch (err) {
      alert(err.response?.data?.errors?.[0] || "Failed to add task.");
    }
  };

  const handleToggleTodo = async (todoId, currentStatus) => {
    try {
      const nextStatus = currentStatus === "completed" ? "pending" : "completed";
      const res = await updateTodo(todoId, { status: nextStatus });
      if (res.data?.success) {
        setTodos(todos.map(t => t._id === todoId ? res.data.data : t));
      }
    } catch (err) {
      alert("No permission.");
    }
  };

  if (loading) return <div className="card">Loading group info...</div>;
  if (error || !group) {
    return (
      <div className="groups-page">
        <div className="card alert-error">
          <p>{error || "Can't find this group."}</p>
          <button onClick={() => window.location.reload()} className="btn" style={{ marginTop: '10px' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-page">
      <div className="card">
        <h2 className="page-title">{group.name}</h2>
        <p className="muted">{group.description || "No description provided."}</p>

        <div className="group-meta" style={{ marginTop: '10px' }}>
          <strong>Owner: </strong> {group.ownerId?.name || "Unknown"} ({group.ownerId?.email || "No email"})
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <h3>Members ({group.members?.length || 0})</h3>
              <div className="member-list" style={{ marginTop: "15px" }}>
                {group.members?.map((member) => (
                  <div key={member._id} className="member-item" style={{ padding: "10px 0", borderBottom: "1px solid #333" }}>
                    <div style={{ fontWeight: "bold" }}>{member.name || "Unknown User"}</div>
                    <div className="muted" style={{ fontSize: "12px" }}>{member.email}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <InviteMember groupId={group._id} />
            </div>
          </div>

          <div className="card">
            <h3>Group Tasks</h3>
            
            <form onSubmit={handleAddTodo} style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="What needs to be done in this group?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>

            <div className="todo-list" style={{ marginTop: "20px" }}>
              {todos.length > 0 ? (
                todos.map((todo) => (
                  <div key={todo._id} className="todo-item" style={{ 
                    padding: "12px", 
                    borderBottom: "1px solid #333", 
                    display: "flex", 
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <input 
                      type="checkbox" 
                      checked={todo.status === "completed"}
                      onChange={() => handleToggleTodo(todo._id, todo.status)}
                    />
                    <span style={{ 
                      flex: 1, 
                      textDecoration: todo.status === "completed" ? "line-through" : "none",
                      color: todo.status === "completed" ? "#888" : "#eee"
                    }}>
                      {todo.content}
                    </span>
                    <span className={`badge ${todo.status}`} style={{ fontSize: "10px" }}>
                      {todo.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="muted" style={{ textAlign: "center", marginTop: "20px" }}>No tasks for this group.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}