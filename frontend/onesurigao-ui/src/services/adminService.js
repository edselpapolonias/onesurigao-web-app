import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/admins/";

export const getAdmins = () => {
  return axios.get(API_URL);
};

export const createAdmin = (data) => {
  return axios.post(API_URL, data);
};