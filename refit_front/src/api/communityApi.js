// import axios from "axios";

// const API_SERVER_HOST = "http://localhost:8080";

// const host = `${API_SERVER_HOST}/api/community`;

// export const postAdd = async (post) => {
//   const res = await axios.post(`${host}/`, post);
//   return res.data;
// };

// export const getList = async (page, size) => {
//   const res = await axios.get(`${host}/list`, { params: { page, size } });
//   return res.data;
// };

// export const getOne = async (cno) => {
//   const res = await axios.get(`${host}/${cno}`);
//   return res.data;
// };

// export const putOne = async (cno, post) => {
//   const res = await axios.put(`${host}/${cno}`, post);
//   return res.data;
// };

// export const deleteOne = async (cno) => {
//   const res = await axios.delete(`${host}/${cno}`);
//   return res.data;
// };

//아래는 임시입니다.

// import axios from "axios";

// const API_SERVER_HOST = "http://localhost:8080";
// const host = `${API_SERVER_HOST}/api/community`;

// 더미 데이터 기반 커뮤니티 API

let dummyDB = [
  {
    cno: 1,
    title: "더미 제목 1",
    content: "내용 1입니다.",
    writer: "홍길동",
    regDate: "2025-06-30",
    imageFile: null,
  },
  {
    cno: 2,
    title: "더미 제목 2",
    content: "내용 2입니다.",
    writer: "김철수",
    regDate: "2025-06-29",
    imageFile: null,
  },
];

let nextCno = 3;

export const getList = async () => {
  return {
    dtoList: dummyDB,
    page: 1,
    size: 10,
    total: dummyDB.length,
    pageNumList: [1],
    prev: false,
    next: false,
    start: 1,
    end: 1,
  };
};

export const getOne = async (cno) => {
  const found = dummyDB.find((item) => item.cno === parseInt(cno));
  return found || null;
};

export const postAdd = async (post) => {
  const newPost = {
    ...post,
    cno: nextCno++,
    regDate: new Date().toISOString().split("T")[0],
  };
  dummyDB.unshift(newPost);
  return { result: newPost.cno };
};

export const putOne = async (cno, post) => {
  const index = dummyDB.findIndex((item) => item.cno === parseInt(cno));
  if (index !== -1) {
    dummyDB[index] = {
      ...dummyDB[index],
      ...post,
    };
    return { result: true };
  }
  return { result: false };
};

export const deleteOne = async (cno) => {
  dummyDB = dummyDB.filter((item) => item.cno !== parseInt(cno));
  return { result: true };
};
