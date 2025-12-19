import axiosClient from "./axiosClient";

export const getMyGroups = () =>{
    return axiosClient.get("/groups/my-groups");
};
export const getGroupById = (groupId) => {
    return axiosClient.get(`/groups/${groupId}`);
};
export const createGroup = (payload) => {
    return axiosClient.post("/groups", payload);
};
export const updateGroup = (groupId, payload) => {
    return axiosClient.put(`/groups/${groupId}`, payload);
};
export const deleteGroup = (groupId) => {
    return axiosClient.delete(`/groups/${groupId}`);
};
export const leaveGroup = (groupId) => {
    return axiosClient.post(`/groups/${groupId}/leave`);
};