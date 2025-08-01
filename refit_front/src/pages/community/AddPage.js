import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAdd } from "../../api/communityApi";

const AddPage = () => {
  const [form, setForm] = useState({ title: "", content: "", writer: "" });
  const [imageFile, setImageFile] = useState(null); // 사용 안 된다는 경고 해결을 위해 사용
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      ...form,
      imageFile: imageFile ? imageFile.name : null,
    };
    const result = await postAdd(postData);
    if (result?.result) {
      alert("등록 성공!");
      navigate("/community");
    }
  };

  return (
    <div className="p-4 w-full bg-white pt-52">
      <h2 className="text-xl font-bold mb-4">글쓰기</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="title"
          placeholder="제목"
          value={form.title}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <textarea
          name="content"
          placeholder="내용"
          value={form.content}
          onChange={handleChange}
          className="border p-2 h-32"
          required
        />
        <input
          type="text"
          name="writer"
          placeholder="작성자"
          value={form.writer}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="border p-2"
        />
        <button type="submit" className="bg-black text-white py-2 rounded">
          등록
        </button>
      </form>
    </div>
  );
};

export default AddPage;
