// services/authService.js
import api from "./apiToken";

export const login = async (identifier, password) => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });
  return response.data;
};
