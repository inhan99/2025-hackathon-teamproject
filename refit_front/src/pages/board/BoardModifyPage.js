import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchPostByIdAndType, updatePostByType } from "../../api/boardApi";

const BoardModifyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // page 정보 추출
  const page =
    location.state?.page ??
    new URLSearchParams(location.search).get("page") ??
    0;

  // 현재 URL에서 게시판 타입 추출
  const getBoardType = () => {
    const path = location.pathname;
    if (path.includes("/boards/freedom")) return "freedom";
    if (path.includes("/boards/secret")) return "secret";
    if (path.includes("/boards/share")) return "share";
    return "freedom"; // 기본값
  };

  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writer, setWriter] = useState("");
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 URL 리스트
  const [newImages, setNewImages] = useState([]); // 새로 추가하는 이미지 파일 리스트
  const [newPreviewUrls, setNewPreviewUrls] = useState([]); // 새 이미지 미리보기 URL

  useEffect(() => {
    const boardType = getBoardType();
    fetchPostByIdAndType(boardType, id).then((res) => {
      const data = res.data;
      setTitle(data.title);
      setContent(data.content);
      setWriter(data.writer);
      setExistingImages(
        data.images
          ? data.images.map(
              (img) => `http://localhost:8080/uploads/${img.imageUrl}`
            )
          : []
      );
    });
  }, [id]);

  const handleNewImageAdd = (e) => {
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

      // 최대 5개 제한 (기존 이미지 + 새 이미지)
      if (existingImages.length + newImages.length >= 5) {
        alert("이미지는 최대 5개까지 업로드할 수 있습니다.");
        return;
      }

      // 이미지 추가
      const newImagesArray = [...newImages, file];
      setNewImages(newImagesArray);

      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setNewPreviewUrls([...newPreviewUrls, url]);

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleNewImageRemove = (index) => {
    // 새 이미지 제거
    const newImagesArray = newImages.filter((_, i) => i !== index);
    setNewImages(newImagesArray);

    // 미리보기 URL 제거 및 메모리 해제
    const urlToRevoke = newPreviewUrls[index];
    URL.revokeObjectURL(urlToRevoke);
    const newPreviewUrlsArray = newPreviewUrls.filter((_, i) => i !== index);
    setNewPreviewUrls(newPreviewUrlsArray);
  };

  // 기존 이미지 삭제
  const handleRemoveExistingImage = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviewUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 기존 이미지 경로만 추출 (서버에 넘길 DTO에 맞게)
    // URL에서 실제 이미지명만 빼야 할 수도 있음 (서버 규칙에 맞게 조정 필요)
    const existingImageNames = existingImages.map((url) =>
      url.replace("http://localhost:8080/uploads/", "")
    );

    const boardRequestDTO = {
      title,
      content,
      writer,
      existingImages: existingImageNames, // DTO 필드명 맞춰서 넘김
    };

    try {
      const boardType = getBoardType();
      await updatePostByType(boardType, id, boardRequestDTO, newImages);
      alert("게시글이 수정되었습니다.");
      navigate(`/boards/${boardType}/post/${id}`, { state: { page } });
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 pt-52">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded h-40"
        />
        <input
          type="text"
          value={writer}
          readOnly
          className="w-full border px-3 py-2 rounded bg-gray-100"
          placeholder="작성자"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기존 이미지
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {existingImages.map((imgUrl, idx) => (
              <div key={idx} className="relative">
                <img
                  src={imgUrl}
                  alt={`existing-${idx}`}
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 이미지 추가
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleNewImageAdd}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 [&::file-selector-button]:mr-4 [&::file-selector-button]:py-2 [&::file-selector-button]:px-4 [&::file-selector-button]:rounded-full [&::file-selector-button]:border-0 [&::file-selector-button]:text-sm [&::file-selector-button]:font-semibold [&::file-selector-button]:bg-blue-50 [&::file-selector-button]:text-blue-700 [&::file-selector-button]:hover:bg-blue-100"
            style={{ color: "transparent" }}
          />
          <p className="text-xs text-gray-500 mt-1">
            이미지 파일만 선택 가능 (최대 5MB, 최대 5개)
          </p>
          {existingImages.length + newImages.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              현재 {existingImages.length + newImages.length}/5개 이미지
            </p>
          )}
        </div>

        {/* 새 이미지 미리보기 */}
        {newPreviewUrls.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가된 새 이미지 ({newPreviewUrls.length}개)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {newPreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`새 이미지 미리보기 ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleNewImageRemove(index)}
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
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          수정 완료
        </button>
      </form>
    </div>
  );
};

export default BoardModifyPage;
