import axiosClient from "./axiosClient";

export const getTodos = (params = {}) => {
  return axiosClient.get("/todos", {params});
};

export const createTodo = (payload) => {
  return axiosClient.post("/todos", payload);
};

export const updateTodo = (todoId, payload) => {
  return axiosClient.patch(`/todos/${todoId}`, payload);
};
export const deleteTodo = (todoId) => {
  return axiosClient.delete(`/todos/${todoId}`);
};