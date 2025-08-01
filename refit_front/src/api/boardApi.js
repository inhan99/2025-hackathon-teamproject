import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const API_BASE = "http://localhost:8080/api";

// JWT 토큰을 헤더에 추가하는 함수
const getAuthHeaders = () => {
  const memberInfo = getCookie("member");
  console.log("[DEBUG] getAuthHeaders - memberInfo:", memberInfo);
  if (memberInfo && memberInfo.accessToken) {
    const headers = {
      Authorization: `Bearer ${memberInfo.accessToken}`,
    };
    console.log("[DEBUG] getAuthHeaders - returning headers:", headers);
    return headers;
  }
  console.log(
    "[DEBUG] getAuthHeaders - no token found, returning empty object"
  );
  return {};
};

// 게시글 전체 목록 조회 (기존 호환성)
export const fetchPosts = () =>
  axios.get(`${API_BASE}/boards`, {
    headers: getAuthHeaders(),
  });

// 게시글 전체 목록 조회 (페이징)
export const fetchPostsWithPaging = (page = 0, size = 10) =>
  axios.get(`${API_BASE}/boards/list/paging?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 게시글 목록 조회
export const fetchPostsByType = (boardType) =>
  axios.get(`${API_BASE}/boards/${boardType}`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 게시글 목록 조회 (페이징)
export const fetchPostsByTypeWithPaging = (boardType, page = 0, size = 10) =>
  axios.get(
    `${API_BASE}/boards/${boardType}/list/paging?page=${page}&size=${size}`,
    {
      headers: getAuthHeaders(),
    }
  );

// 게시글 목록 조회 (댓글 개수 포함) - 백엔드에서 지원하는 경우 사용
export const fetchPostsWithCommentCount = () =>
  axios.get(`${API_BASE}/boards/with-comments`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 게시글 목록 조회 (댓글 개수 포함)
export const fetchPostsWithCommentCountByType = (boardType) =>
  axios.get(`${API_BASE}/boards/${boardType}/with-comments`, {
    headers: getAuthHeaders(),
  });

// 게시글 단건 조회
export const fetchPostById = (id) =>
  axios.get(`${API_BASE}/boards/${id}`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 게시글 단건 조회
export const fetchPostByIdAndType = (boardType, id) =>
  axios.get(`${API_BASE}/boards/${boardType}/${id}`, {
    headers: getAuthHeaders(),
  });

// 게시글 작성 (기존 호환성)
export const createPost = (boardRequestDTO, images) => {
  const formData = new FormData();

  // 디버깅 로그
  console.log("[DEBUG] boardRequestDTO:", boardRequestDTO);
  console.log("[DEBUG] images:", images);

  // 개별 필드로 추가
  formData.append("title", boardRequestDTO.title);
  formData.append("content", boardRequestDTO.content);

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((imageFile) => {
      formData.append("images", imageFile);
    });
  }

  // FormData 내용 확인
  for (let [key, value] of formData.entries()) {
    console.log("[DEBUG] FormData:", key, value);
  }

  return axios
    .post(`${API_BASE}/boards`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders(),
      },
    })
    .catch((error) => {
      console.error("[ERROR] Request failed:", error.response?.data);
      console.error("[ERROR] Status:", error.response?.status);
      console.error("[ERROR] Headers:", error.response?.headers);
      throw error;
    });
};

// 게시판 타입별 게시글 작성
export const createPostByType = (boardType, boardRequestDTO, images) => {
  const formData = new FormData();

  // 디버깅 로그
  console.log("[DEBUG] boardType:", boardType);
  console.log("[DEBUG] boardRequestDTO:", boardRequestDTO);
  console.log("[DEBUG] images:", images);

  // 개별 필드로 추가
  formData.append("title", boardRequestDTO.title);
  formData.append("content", boardRequestDTO.content);

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((imageFile) => {
      formData.append("images", imageFile);
    });
  }

  // FormData 내용 확인
  for (let [key, value] of formData.entries()) {
    console.log("[DEBUG] FormData:", key, value);
  }

  const headers = {
    "Content-Type": "multipart/form-data",
    ...getAuthHeaders(),
  };
  console.log("[DEBUG] createPostByType - final headers:", headers);

  return axios
    .post(`${API_BASE}/boards/${boardType}`, formData, {
      headers: headers,
    })
    .catch((error) => {
      console.error("[ERROR] Request failed:", error.response?.data);
      console.error("[ERROR] Status:", error.response?.status);
      console.error("[ERROR] Headers:", error.response?.headers);
      throw error;
    });
};

// 게시글 수정 (기존 호환성)
export const updatePost = (id, boardRequestDTO, images) => {
  const formData = new FormData();

  // 디버깅 로그
  console.log("[DEBUG] updatePost - boardRequestDTO:", boardRequestDTO);
  console.log("[DEBUG] updatePost - images:", images);

  // 개별 필드로 추가
  formData.append("title", boardRequestDTO.title);
  formData.append("content", boardRequestDTO.content);
  formData.append("writer", boardRequestDTO.writer);

  // 기존 이미지 추가
  if (
    boardRequestDTO.existingImages &&
    Array.isArray(boardRequestDTO.existingImages)
  ) {
    boardRequestDTO.existingImages.forEach((imageUrl) => {
      formData.append("existingImages", imageUrl);
    });
  }

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((imageFile) => {
      formData.append("images", imageFile);
    });
  }

  // FormData 내용 확인
  for (let [key, value] of formData.entries()) {
    console.log("[DEBUG] FormData:", key, value);
  }

  return axios.put(`${API_BASE}/boards/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getAuthHeaders(),
    },
  });
};

// 게시판 타입별 게시글 수정
export const updatePostByType = (boardType, id, boardRequestDTO, images) => {
  const formData = new FormData();

  // 디버깅 로그
  console.log("[DEBUG] updatePostByType - boardType:", boardType);
  console.log("[DEBUG] updatePostByType - boardRequestDTO:", boardRequestDTO);
  console.log("[DEBUG] updatePostByType - images:", images);

  // 개별 필드로 추가
  formData.append("title", boardRequestDTO.title);
  formData.append("content", boardRequestDTO.content);
  formData.append("writer", boardRequestDTO.writer);

  // 기존 이미지 추가
  if (
    boardRequestDTO.existingImages &&
    Array.isArray(boardRequestDTO.existingImages)
  ) {
    boardRequestDTO.existingImages.forEach((imageUrl) => {
      formData.append("existingImages", imageUrl);
    });
  }

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((imageFile) => {
      formData.append("images", imageFile);
    });
  }

  // FormData 내용 확인
  for (let [key, value] of formData.entries()) {
    console.log("[DEBUG] FormData:", key, value);
  }

  return axios.put(`${API_BASE}/boards/${boardType}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getAuthHeaders(),
    },
  });
};

// 게시글 삭제 (기존 호환성)
export const deletePost = (id) =>
  axios.delete(`${API_BASE}/boards/${id}`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 게시글 삭제
export const deletePostByType = (boardType, id) =>
  axios.delete(`${API_BASE}/boards/${boardType}/${id}`, {
    headers: getAuthHeaders(),
  });

// 댓글 관련 API 함수들 (기존 호환성)
// 댓글 목록 조회
export const fetchComments = (postId) =>
  axios.get(`${API_BASE}/boards/${postId}/comments`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 댓글 목록 조회 (페이징)
export const fetchCommentsByType = (boardType, postId, page = 0, size = 10) =>
  axios.get(
    `${API_BASE}/boards/${boardType}/${postId}/comments/paging?page=${page}&size=${size}`,
    {
      headers: getAuthHeaders(),
    }
  );

// 게시판 타입별 댓글 목록 조회 (기존)
export const fetchCommentsByTypeLegacy = (boardType, postId) =>
  axios.get(`${API_BASE}/boards/${boardType}/${postId}/comments`, {
    headers: getAuthHeaders(),
  });

// 댓글 작성 (기존 호환성)
export const createComment = (postId, commentData) =>
  axios.post(`${API_BASE}/boards/${postId}/comments`, commentData, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 댓글 작성
export const createCommentByType = (boardType, postId, commentData) =>
  axios.post(
    `${API_BASE}/boards/${boardType}/${postId}/comments`,
    commentData,
    {
      headers: getAuthHeaders(),
    }
  );

// 댓글 수정 (기존 호환성)
export const updateComment = (postId, commentId, commentData) =>
  axios.put(`${API_BASE}/boards/${postId}/comments/${commentId}`, commentData, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 댓글 수정
export const updateCommentByType = (
  boardType,
  postId,
  commentId,
  commentData
) =>
  axios.put(
    `${API_BASE}/boards/${boardType}/${postId}/comments/${commentId}`,
    commentData,
    {
      headers: getAuthHeaders(),
    }
  );

// 댓글 삭제 (기존 호환성)
export const deleteComment = (postId, commentId) =>
  axios.delete(`${API_BASE}/boards/${postId}/comments/${commentId}`, {
    headers: getAuthHeaders(),
  });

// 게시판 타입별 댓글 삭제
export const deleteCommentByType = (boardType, postId, commentId) =>
  axios.delete(
    `${API_BASE}/boards/${boardType}/${postId}/comments/${commentId}`,
    {
      headers: getAuthHeaders(),
    }
  );

// ========== 답글 관련 API 함수들 ==========

// 답글 생성
export const createReply = (replyData) =>
  axios.post(`${API_BASE}/replies`, replyData, {
    headers: getAuthHeaders(),
  });

// 특정 댓글의 모든 답글 조회
export const fetchRepliesByCommentId = (commentId) =>
  axios.get(`${API_BASE}/replies/comment/${commentId}`, {
    headers: getAuthHeaders(),
  });

// 답글 수정
export const updateReply = (replyId, replyData) =>
  axios.put(`${API_BASE}/replies/${replyId}`, replyData, {
    headers: getAuthHeaders(),
  });

// 답글 삭제
export const deleteReply = (replyId) =>
  axios.delete(`${API_BASE}/replies/${replyId}`, {
    headers: getAuthHeaders(),
  });

// 특정 댓글의 답글 개수 조회
export const fetchReplyCountByCommentId = (commentId) =>
  axios.get(`${API_BASE}/replies/comment/${commentId}/count`, {
    headers: getAuthHeaders(),
  });
