import { useEffect, useState, useRef } from "react";
import { getMyInvitations, acceptInvitation, rejectInvitation } from "../../../../api/invitation.api";

export default function InvitationNotification() {
  const [invites, setInvites] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchInvites = async () => {
    try {
      const res = await getMyInvitations();
      if (res.data?.success) {
        setInvites(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch invitations");
    }
  };

  useEffect(() => {
    fetchInvites();
    const interval = setInterval(fetchInvites, 30000); 
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = async (token, action) => {
    try {
      const res = action === "accept" 
        ? await acceptInvitation(token) 
        : await rejectInvitation(token);
      
      if (res.data.success) {
        setInvites((prev) => prev.filter((i) => i.token !== token));
        if (action === "accept") window.location.reload();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Notification Bell - ALWAYS VISIBLE */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', 
          padding: '8px', position: 'relative', color: '#fff' 
        }}
      >
        🔔
        {invites.length > 0 && (
          <span style={{
            position: 'absolute', top: '0', right: '0', background: '#ff3b3b',
            color: 'white', borderRadius: '50%', fontSize: '10px', padding: '2px 6px'
          }}>
            {invites.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '45px', right: '0', width: '300px',
          background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 10000, overflow: 'hidden'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#fff' }}>
            Notifications
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {invites.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                No new notifications
              </div>
            ) : (
              invites.map((invite) => (
                <div key={invite._id} style={{ padding: '12px', borderBottom: '1px solid #222' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#eee', lineHeight: '1.4' }}>
                    <b>{invite.inviterName}</b> invited you to join <b>{invite.groupName}</b>
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleAction(invite.token, 'accept')}
                      style={{ flex: 1, padding: '6px', background: '#2d7cff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleAction(invite.token, 'reject')}
                      style={{ flex: 1, padding: '6px', background: '#333', color: '#ccc', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}