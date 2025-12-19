import { useEffect, useState } from "react";
import { 
  getMyGroups, 
  createGroup, 
  deleteGroup 
} from "../../api/group.api"; 
import { Link } from "react-router-dom";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState(""); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await getMyGroups();
      const list = Array.isArray(res.data.data) 
        ? res.data.data 
        : res.data.data?.groups || [];

      setGroups(list);
    } catch (err) {
      console.error("Failed to load groups", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await createGroup({ name });
      if (res.data?.success) {
        setGroups((prev) => [res.data.data, ...prev]);
        setName("");
      }
    } catch (err) {
      console.error("Create group failed:", err.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;

    try {
      const res = await deleteGroup(id);
      if (res.data?.success) {
        setGroups(groups.filter((g) => g._id !== id));
      }
    } catch (err) {
      console.error("Delete group failed", err);
    }
  };

  return (
    <div>
      <h1 className="page-title">Groups</h1>

      <form onSubmit={handleCreate} className="card">
        <input
          placeholder="New group name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add Group</button>
      </form>

      {loading ? (
        <p>Loading groups...</p>
      ) : (
        <div className="group-list">
          {groups.length === 0 ? (
            <p className="muted">No groups found. Try creating one!</p>
          ) : (
            groups.map((group) => (
              <div key={group._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    {group.name}
                  </span>
                  <span className="muted" style={{ fontSize: '12px' }}>
                    Members: {group.members?.length || 0}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/dashboard/groups/${group._id}`} className="btn-link">View</Link>
              <button onClick={() => handleDelete(group._id)} style={{ background: '#ff3b3b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
                Delete
              </button>
            </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}