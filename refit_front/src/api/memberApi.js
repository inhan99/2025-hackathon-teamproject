import axios from "axios";
import { API_SERVER_HOST } from "./productsApi";

import jwtAxios from "../util/jwtUtil";

//http://localhost:8080/api/member/login
const host = `${API_SERVER_HOST}/api/member`;

export const loginPost = async ({ email, pw }) => {
  const res = await axios.post(
    `${API_SERVER_HOST}/api/member/login`,
    { email, pw },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("res:", res.data.member);
  return res.data;
};

export const modifyMember = async (member) => {
  const res = await jwtAxios.put(`${host}/modify`, member);

  return res.data;
};

export const getCurrentMember = async () => {
  const res = await jwtAxios.get(`${host}/current`);
  return res.data;
};
