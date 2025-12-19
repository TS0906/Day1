import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroupById } from "../../../api/group.api";
import InviteMember from "./invitations/InviteMember";
import "./group.css";

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchGroupInfo = async () => {
      setLoading(true);
      try {
        const res = await getGroupById(groupId);
        if (res.data?.success) {
          setGroup(res.data.data);
          setError(null);
        } else {
          setError(res.data?.errors?.[0] || "Group not found.");
        }
      } catch (err) {
        console.error("Failed loading group detail.", err);

        setError(err.response?.data?.error || "An internal server error occurred.");
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchGroupInfo();
  }, [groupId]);

  if (loading) return <div className="card">Loading group info...</div>;

  if (error || !group) {
    return (
      <div className="groups-page">
        <div className="card alert-error">
          <p>{error || "Can't find this group."}</p>
          <button onClick={() => window.location.reload()} className="btn" style={{marginTop: '10px'}}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-page">
      <div className="card">
        <h2 className="page-title">{group.name}</h2>
        <p className="muted">{group.description || "No description provided."}</p>
        
        <div className="group-meta" style={{marginTop: '10px'}}>
          <strong>Owner: </strong> {group.ownerId?.name || "Unknown"} ({group.ownerId?.email || "No email"})
        </div>

        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px"}}>
          <div className="card">
            <h3>Members ({group.members?.length || 0})</h3>
            <div className="member-list" style={{marginTop: "15px"}}>
              {group.members && group.members.length > 0 ? (
                group.members.map((member, index) => (
                  <div key={member._id || index} className="member-item" style={{padding : "10px 0", borderBottom: "1px solid #333"}}>
                    <div style={{fontWeight: "bold"}}>{member.name || "Unknown User"}</div>
                    <div className="muted" style={{fontSize: "12px"}}>{member.email || "No email"}</div>
                  </div>
                ))
              ) : (
                <div className="muted">No members in this group.</div>
              )}
            </div>
          </div>
          
          <div className="card">
              <InviteMember groupId={group._id} />
          </div>
        </div>
      </div>
    </div>
  );
}