import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/login/";

export const loginAdmin = (data) => {
  return axios.post(API_URL, data);
};