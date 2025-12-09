import api from "./apiToken";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export const login = async (identifier, password, rememberMe) => {
  const res = await api.post("/auth/login", {
    identifier,
    password,
    rememberMe,
  });

  return res.data;
};

export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`;
};


export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/auth/register`, userData);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

