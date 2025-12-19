import { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import "../group.css"; 

export default function InviteMember({ groupId }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!keyword.trim()){
      setUsers([]);
      return;
    };
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      axiosClient.get(`/invitations/search-user?email=${keyword}`)
        .then(res => {
          if (res.data?.success && res.data.data) {
            setUsers([res.data.data]); 
          } else {
            setUsers([]);
          }
        })
        .catch(() => setUsers([]))
        .finally(() => setLoading(false));
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const onInvite = async (email) => {
    setLoading(true);
    try {
      const res = await axiosClient.post(`/invitations/groups/${groupId}/invite`, {inviteeEmail: email});
      if(res.data.success){
        alert("Sent success!");
        setKeyword("");
      }
    } catch (err) { 
      const errorMsg = err.response?.data?.errors?.[0] || "Failed to send invitation";
      alert(errorMsg);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="invite-section">
      <h4 style={{marginBottom: '10px'}}>Invite New Member</h4>
      <input 
        className="input" 
        placeholder="Type email to search..." 
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)} 
      />
      <div style={{marginTop: '10px'}}>
        {loading && <div className="muted">Searching...</div>}
        
        {!loading && users.map(u => (
          <div key={u._id} className="invite-result-row" style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #333'}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span>{u.name}</span>
              <small className="muted">{u.email}</small>
            </div>
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={() => onInvite(u.email)}>
              Invite
            </button>
          </div>
        ))}
        {keyword && users.length === 0 && !loading && (
          <div className="muted" style={{padding: '10px 0'}}>Can't find user.</div>
        )}
      </div>
    </div>
  );
}