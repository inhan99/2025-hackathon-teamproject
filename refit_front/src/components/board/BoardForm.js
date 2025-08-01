import React, { useState, useEffect } from "react";

const BoardForm = ({ onSubmit, initialData = {} }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [writer, setWriter] = useState(initialData.writer || "");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // 미리보기 URL 생성
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // 컴포넌트 언마운트 시 미리보기 URL 메모리 해제
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !writer.trim()) {
      alert("제목, 내용, 작성자를 모두 입력해주세요.");
      return;
    }

    const formData = new FormData();

    // boardRequestDTO 라는 key로 JSON Blob 형식으로 DTO 전체를 보냄
    const boardRequestDTO = { title, content, writer };
    formData.append(
      "boardRequestDTO",
      new Blob([JSON.stringify(boardRequestDTO)], { type: "application/json" })
    );

    // 이미지 파일 여러 개 첨부
    images.forEach((file) => formData.append("images", file));

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label>내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="textarea"
        />
      </div>

      <div>
        <label>작성자</label>
        <input
          type="text"
          value={writer}
          onChange={(e) => setWriter(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">
          이미지 첨부 (여러 개 가능)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="block"
        />
        <div className="flex gap-4 mt-4 flex-wrap">
          {previewUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`preview-${idx}`}
              className="w-32 h-32 object-cover rounded border"
            />
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        등록하기
      </button>
    </form>
  );
};

export default BoardForm;
