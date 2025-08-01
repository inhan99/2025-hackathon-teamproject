import React from "react";

const AddComponent = ({ title, setTitle, content, setContent, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-2">
        <label>제목</label>
        <input
          type="text"
          className="border w-full p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
        />
      </div>
      <div className="mb-2">
        <label>내용</label>
        <textarea
          className="border w-full p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={6}
        />
      </div>
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        등록
      </button>
    </form>
  );
};

export default AddComponent;
