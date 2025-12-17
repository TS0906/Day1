import { useEffect, useMemo, useState } from "react";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../../../api/todo.api";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./todo.css";

function normalizeTodoResponse(resData) {
    const data = resData?.data;
    if(Array.isArray(data)) return {items: data, total: data.length};
    if(data && Array.isArray(data.items)) return {items: data.items, total: data.total ?? data.items.length};
    if(data && Array.isArray(data.todos)) return {items: data.todos, total: data.total ?? data.todos.length};
    return {items: [], total: 0};
}

export default function TodosPage() {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const [page, setPage] = useState(1);
    const limit = 10;
    const [total, setTotal] = useState(0);
    const pageCount = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total]);

    // Lọc dữ liệu tại Frontend
    const filteredTodos = useMemo(() => {
        if (filter === "all") return todos;
        return todos.filter(t => {
            const isDone = t.status === "completed" || t.completed === true;
            return filter === "completed" ? isDone : !isDone;
        });
    }, [todos, filter]);

    const fetchTodos = async (p = page) =>{
        setLoading(true);
        setError("");
        try{
            const res = await getTodos({page: p, limit});
            const normalized = normalizeTodoResponse(res.data);
            setTodos(normalized.items);
            setTotal(normalized.total);
        } catch(err){
            setError(err.normalizedMessage || "Failed to load todos");
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => { fetchTodos(1); }, []);

    const onToggle = async (todo) => {
        const id = todo?._id;
        if (!id) return;
        setBusyId(id);
        try {
            const isCurrentlyDone = todo.status === "completed" || todo.completed === true;
            const res = await updateTodo(id, { completed: !isCurrentlyDone });
            const updated = res.data?.data;
            if (updated) {
                setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
            }
        } catch (err) {
            setError("Update failed");
        } finally {
            setBusyId(null);
        }
    };

    const onCreate = async(content) => {
        try {
            const res = await createTodo({content});
            if(res.data?.data) {
                setTodos((prev) => [res.data.data, ...prev]);
                setTotal(t => t + 1);
            }
            return{ok: true};
        } catch (err) { return {ok: false}; }
    };

    const onRemove = async (todoId) => {
        if (!window.confirm("Delete this todo?")) return;
        setBusyId(todoId);
        try {
            await deleteTodo(todoId);
            setTodos((prev) => prev.filter((t) => t._id !== todoId));
            setTotal((t) => Math.max(0, t - 1));
        } finally { setBusyId(null); }
    };

    return (
        <div className="todos-page">
            <div className="todos-header">
                <h1 className="page-title">Todos</h1>
                <button className="btn" onClick={() => fetchTodos(page)} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <TodoForm onCreate={onCreate} />

            <div className="filter-tabs card">
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
                <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Done</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="card">Loading...</div>
            ) : (
                <TodoList todos={filteredTodos} busyId={busyId} onToggle={onToggle} onRemove={onRemove} />
            )}

            <div className="todos-footer">
                <div className="muted">Total: <b>{total}</b></div>
                <div className="pager">
                    <button className="btn" onClick={() => fetchTodos(page - 1)} disabled={loading || page <= 1}>Prev</button>
                    <span className="muted">Page <b>{page}</b> / {pageCount}</span>
                    <button className="btn" onClick={() => fetchTodos(page + 1)} disabled={loading || page >= pageCount}>Next</button>
                </div>
            </div>
        </div>
    );
}