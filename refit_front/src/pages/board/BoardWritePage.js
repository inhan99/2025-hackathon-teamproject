import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPostByType } from "../../api/boardApi";

const BoardWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // 현재 URL에서 게시판 타입 추출
  const getBoardType = () => {
    const path = location.pathname;
    if (path.includes("/boards/freedom")) return "freedom";
    if (path.includes("/boards/secret")) return "secret";
    if (path.includes("/boards/share")) return "share";
    return "freedom"; // 기본값
  };

  const handleImageAdd = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 선택해주세요.");
        return;
      }

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 최대 5개 제한
      if (images.length >= 5) {
        alert("이미지는 최대 5개까지 업로드할 수 있습니다.");
        return;
      }

      // 이미지 추가
      const newImages = [...images, file];
      setImages(newImages);

      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrls([...previewUrls, url]);

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageRemove = (index) => {
    // 이미지 제거
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // 미리보기 URL 제거 및 메모리 해제
    const urlToRevoke = previewUrls[index];
    URL.revokeObjectURL(urlToRevoke);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
  };

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const boardRequestDTO = { title, content };
    const boardType = getBoardType();

    try {
      await createPostByType(boardType, boardRequestDTO, images);
      alert("게시글이 등록되었습니다!");

      // 현재 게시판 타입에 따라 적절한 경로로 리다이렉트
      navigate(`/boards/${boardType}`);
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 pt-52">
      <h1 className="text-2xl font-bold mb-6">게시글 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded h-40"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 추가
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageAdd}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 [&::file-selector-button]:mr-4 [&::file-selector-button]:py-2 [&::file-selector-button]:px-4 [&::file-selector-button]:rounded-full [&::file-selector-button]:border-0 [&::file-selector-button]:text-sm [&::file-selector-button]:font-semibold [&::file-selector-button]:bg-blue-50 [&::file-selector-button]:text-blue-700 [&::file-selector-button]:hover:bg-blue-100"
            style={{ color: "transparent" }}
          />
          <p className="text-xs text-gray-500 mt-1">
            이미지 파일만 선택 가능 (최대 5MB, 최대 5개)
          </p>
          {images.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              현재 {images.length}/5개 이미지 선택됨
            </p>
          )}
        </div>

        {/* 이미지 미리보기 */}
        {previewUrls.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가된 이미지 ({previewUrls.length}개)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          등록
        </button>
      </form>
    </div>
  );
};

export default BoardWritePage;
