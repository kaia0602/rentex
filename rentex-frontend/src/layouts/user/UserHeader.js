import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

import backgroundImage from "assets/images/bg-profile.jpeg";
import { useNavigate } from "react-router-dom";
import api from "api/client";
import { useAuth } from "contexts/AuthContext";

function UserHeader({
  children,
  showEditButton = true,
  showPenaltyPoints = true,
  showImageEditButton = false,
}) {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [menu, setMenu] = useState(null);
  const fileInputRef = useRef(null);

  const openMenu = (event) => setMenu(event.currentTarget);
  const closeMenu = () => setMenu(null);

  const roleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "PARTNER":
        return "파트너";
      default:
        return "일반 회원";
    }
  };

  const handleFileUpload = () => {
    closeMenu();
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 512 * 1024;
    if (file.size > maxSize) {
      alert("파일 크기는 512KB를 초과할 수 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await api.post("/users/me/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refreshUser();
      alert("프로필 사진이 성공적으로 변경되었습니다.");
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert(err.response?.data?.message || "이미지 업로드에 실패했습니다.");
    }
  };

  const handleUrlUpload = async () => {
    closeMenu();
    const imageUrl = prompt("새로운 이미지 URL을 입력하세요:");

    if (imageUrl) {
      try {
        await api.patch("/users/me/profile-image", { url: imageUrl });
        refreshUser(); //
        alert("프로필 사진이 성공적으로 변경되었습니다.");
      } catch (err) {
        alert("URL 변경에 실패했습니다.");
      }
    }
  };

  const handleDelete = async () => {
    closeMenu();
    if (window.confirm("정말로 프로필 사진을 삭제하시겠습니까?")) {
      try {
        await api.delete("/users/me/profile-image");
        refreshUser(); // [수정] 성공 시 공용 user 정보를 새로고침합니다.
        alert("프로필 사진이 삭제되었습니다.");
      } catch (err) {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6),
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      {/* 프로필 카드 */}
      <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDBox position="relative" display="inline-block">
              <MDAvatar
                src={user?.profileImageUrl || "https://via.placeholder.com/150"}
                alt="profile-image"
                size="xl"
                shadow="sm"
              />
              {showImageEditButton && (
                <MDBox position="absolute" bottom={-10} right={-10} transform="translate(30%, 30%)">
                  <IconButton
                    onClick={openMenu}
                    sx={{
                      backgroundColor: "grey.300",
                      "&:hover": { backgroundColor: "grey.400" },
                      boxShadow: 3,
                      p: 1,
                    }}
                  >
                    <Icon fontSize="small">edit</Icon>
                  </IconButton>
                </MDBox>
              )}
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {user?.name || "이름 없음"}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {roleLabel(user?.role)}
              </MDTypography>
              {user && showPenaltyPoints && (
                <MDTypography variant="caption" color="error" fontWeight="medium">
                  누적 벌점: {user.penaltyPoints}점
                </MDTypography>
              )}
            </MDBox>
          </Grid>
          {showEditButton && (
            <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
              <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => navigate("/mypage/edit")}
                >
                  회원정보 수정
                </MDButton>
              </MDBox>
            </Grid>
          )}
        </Grid>
        {children}
      </Card>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      <Menu
        anchorEl={menu}
        open={Boolean(menu)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={handleFileUpload}>파일 업로드</MenuItem>
        <MenuItem onClick={handleUrlUpload}>URL로 변경</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "red" }}>
          사진 삭제
        </MenuItem>
      </Menu>
    </MDBox>
  );
}

UserHeader.defaultProps = {
  children: "",
};

UserHeader.propTypes = {
  children: PropTypes.node,
  showEditButton: PropTypes.bool,
  showPenaltyPoints: PropTypes.bool,
  showImageEditButton: PropTypes.bool,
};

export default UserHeader;
