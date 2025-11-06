// services/authService.js
import axios from "axios";
import api from "./apiToken";

export const login = async (identifier, password) => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });
  return response.data;
};



const API_URL = "http://bkapai.vn/api"; // thay bằng URL backend của bạn

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

