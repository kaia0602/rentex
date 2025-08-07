/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import React, { useState } from "react";
import axios from "axios";
// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

const ItemRegisterForm = () => {
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    stockQuantity: 0,
    dailyPrice: 0,
    status: "AVAILABLE",
    partnerId: 1,
  });

  const [thumbnail, setThumbnail] = useState(null); // 여기 수정

  const handleChange = (e) => {
    setItemData({
      ...itemData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(itemData)], { type: "application/json" }));
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      await axios.post("/api/admin/items/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("등록 성공!");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 실패!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="장비명" onChange={handleChange} />
      <input type="text" name="description" placeholder="설명" onChange={handleChange} />
      <input type="number" name="stockQuantity" placeholder="재고 수량" onChange={handleChange} />
      <input type="number" name="dailyPrice" placeholder="일일 단가" onChange={handleChange} />
      <select name="status" onChange={handleChange}>
        <option value="AVAILABLE">사용 가능</option>
        <option value="UNAVAILABLE">사용 불가</option>
      </select>
      <input type="number" name="partnerId" placeholder="파트너 ID" onChange={handleChange} />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit">등록</button>
    </form>
  );
};

export default ItemRegisterForm;
