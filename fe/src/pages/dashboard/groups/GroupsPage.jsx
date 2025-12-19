import { useEffect, useState } from "react";
import { getMyGroups, createGroup, deleteGroup } from "../../../api/group.api";
import { Link } from "react-router-dom";
import "./group.css";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await getMyGroups();
      if (res.data?.success) setGroups(res.data.data || []);
    } catch (err) {
      setError("Fetch failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await createGroup({ name: newGroupName });
      if (res.data?.success) {
        setGroups((prev) => [res.data.data, ...prev]);
        setNewGroupName("");
      }
    } catch (err) { alert("Error creating group"); }
  };
  const onDeleteGroup = async(id) => {
    if(!window.confirm("Delete this group")) return;
    try {
      await deleteGroup(id);
      setGroups(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };
  const onLeaveGroup = async(id) =>{
    if(!window.confirm("Leave this group?")) return;
    try {
      await deleteGroup(id);
      setGroups(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      alert("Leave failed");
    }
  }
  return (
    <div className="groups-page">
      <div className="groups-header">
        <h1 className="page-title">Groups</h1>
        <button className="btn" onClick={fetchGroups} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <form className="group-form" onSubmit={handleCreate}>
        <input
          className="input"
          placeholder="New group name..."
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Create</button>
      </form>

      {error && <div className="alert-error">{error}</div>}

      <div className="group-list">
        {loading && groups.length === 0 ? (
          <div className="card muted">Checking groups...</div>
        ) : groups.length === 0 ? (
          <div className="card muted">No groups found. Try creating one!</div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="group-item">
              <div className="group-info">
                <Link to={`/dashboard/groups/${group._id}`} className="group-link">
                  <h3>{group.name}</h3>
                </Link>
                <p className="muted">Members: {group.members?.length || 0}</p>
              </div>

              <div className="group-actions" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" onClick={() => onLeaveGroup(group._id)}>Leave</button>
                <button className="btn btn-danger" onClick={() => onDeleteGroup(group._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}