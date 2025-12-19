import axiosClient from "./axiosClient";

export const inviteToGroup = (groupId, email) => {
  return axiosClient.post(`/invitations/groups/${groupId}/invite`, {
    inviteeEmail: email
  });
};

export const getMyInvitations = () => {
  return axiosClient.get("/invitations"); 
};

export const acceptInvitation = (token) => {
  return axiosClient.post(`/invitations/${token}/accept`);
};

export const rejectInvitation = (token) => {
  return axiosClient.post(`/invitations/${token}/reject`);
};