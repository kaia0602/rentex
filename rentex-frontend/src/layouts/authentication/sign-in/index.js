import React, { useEffect, useState } from "react";
import axios from "axios";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);


  useEffect(() => {
    axios
      .get("/api/admin/items") // <- 실제 API 엔드포인트로 수정
      .then((res) => {
        console.log("응답 데이터:", res.data);
        setItems(res.data);
      })
      .catch((err) => {
        console.error("장비 목록 불러오기 실패:", err);
      });
  }, []);

  const handleEdit = (item) => {
  setEditingItem(item);
};

// 수정 폼에서 완료 후 호출할 함수
const handleUpdate = async (updatedItem) => {
  try {
    await axios.put(`/api/admin/items/${updatedItem.id}`, updatedItem);
    alert("수정 성공!");
    // 목록 갱신
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null); // 수정 모드 종료
  } catch (error) {
    console.error("수정 실패:", error);
    alert("수정 실패!");
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/api/admin/items/${id}`);
    alert("삭제 성공!");
    setItems(items.filter(item => item.id !== id)); // 화면에서 삭제 반영
  } catch (error) {
    console.error("삭제 실패:", error);
    alert("삭제 실패!");
  }
};

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            width: "200px",
            textAlign: "center",
          }}
        >
          {item.thumbnailUrl && (
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              style={{ width: "150px", height: "auto", borderRadius: "8px" }}
            />
          )}
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p>수량: {item.stockQuantity}</p>
          <p>일일 대여료: {item.dailyPrice.toLocaleString()}원</p>
          <p>상태: {item.status === "AVAILABLE" ? "사용 가능" : "사용 불가"}</p>

          <button onClick={() => handleEdit(item)}>수정</button>
          <button onClick={() => handleDelete(item.id)}>삭제</button>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
