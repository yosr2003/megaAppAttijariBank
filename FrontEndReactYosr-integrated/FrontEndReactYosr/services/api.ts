import axios from "axios";

const BASE_URL = "http://192.168.100.200:8082/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


