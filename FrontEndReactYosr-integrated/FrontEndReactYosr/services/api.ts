import axios from "axios";

const BASE_URL = "http://172.20.10.13:8082/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


