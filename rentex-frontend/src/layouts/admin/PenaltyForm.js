// src/layouts/admin/PenaltyForm.js
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useState } from "react";

function PenaltyForm() {
  const [form, setForm] = useState({
    userId: "",
    reason: "",
    point: 1,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // TODO: POST /admin/penalties API 호출
    console.log("벌점 부여 요청", form);
  };

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <MDTypography variant="h4">⚠️ 벌점 수동 부여</MDTypography>
        <MDBox mt={4}>
          <MDInput
            label="대상 유저 ID"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            fullWidth
          />
        </MDBox>
        <MDBox mt={2}>
          <MDInput
            label="벌점 사유"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            fullWidth
          />
        </MDBox>
        <MDBox mt={2}>
          <MDInput
            type="number"
            label="벌점 수"
            name="point"
            value={form.point}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 1, max: 5 }}
          />
        </MDBox>
        <MDBox mt={4}>
          <MDButton variant="gradient" color="error" onClick={handleSubmit}>
            벌점 부여
          </MDButton>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default PenaltyForm;
