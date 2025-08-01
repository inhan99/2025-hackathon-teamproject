import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOne, putOne } from "../../api/communityApi";

const ModifyPage = () => {
  const { cno } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", writer: "" });

  useEffect(() => {
    getOne(cno).then((data) => {
      if (data) {
        setForm(data);
      }
    });
  }, [cno]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await putOne(cno, form);
    if (result?.result) {
      alert("수정 완료");
      navigate("/community");
    }
  };

  return (
    <div className="p-4 w-full bg-white pt-52">
      <h2 className="text-xl font-bold mb-4">글 수정</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="border p-2 h-32"
          required
        />
        <input
          type="text"
          name="writer"
          value={form.writer}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          수정
        </button>
      </form>
    </div>
  );
};

export default ModifyPage;
