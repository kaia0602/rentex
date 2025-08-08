import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ItemEdit = () => {
  const { id } = useParams(); // URL에서 아이템 ID 가져옴
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stockQuantity: 0,
    dailyPrice: 0,
    status: "AVAILABLE",
    thumbnail: null,
  });
  const [preview, setPreview] = useState(null);

  // 기존 아이템 데이터 불러오기
  useEffect(() => {
    axios.get(`/api/admin/items/${id}`)
      .then(res => {
        const item = res.data;
        setFormData({
          name: item.name,
          description: item.description,
          stockQuantity: item.stockQuantity,
          dailyPrice: item.dailyPrice,
          status: item.status,
          thumbnail: null,
        });
        setPreview(item.thumbnailUrl); // 기존 이미지 미리보기
      })
      .catch(err => console.error("아이템 불러오기 실패:", err));
  }, [id]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 이미지 선택
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, thumbnail: file }));
    setPreview(URL.createObjectURL(file)); // 새 이미지 미리보기
  };

  // 수정 요청
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    axios.put(`/api/admin/items/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(() => {
      alert("수정 완료!");
      navigate("/items"); // 목록으로 이동
    })
    .catch(err => console.error("수정 실패:", err));
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>아이템 수정</h2>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="이름"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="설명"
        required
      />
      <input
        type="number"
        name="stockQuantity"
        value={formData.stockQuantity}
        onChange={handleChange}
        placeholder="수량"
        required
      />
      <input
        type="number"
        name="dailyPrice"
        value={formData.dailyPrice}
        onChange={handleChange}
        placeholder="일일 대여료"
        required
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="AVAILABLE">사용 가능</option>
        <option value="UNAVAILABLE">사용 불가</option>
      </select>

      <input type="file" onChange={handleFileChange} />
      {preview && <img src={preview} alt="미리보기" style={{ width: "150px", marginTop: "10px" }} />}

      <button type="submit">수정하기</button>
    </form>
  );
};

export default ItemEdit;