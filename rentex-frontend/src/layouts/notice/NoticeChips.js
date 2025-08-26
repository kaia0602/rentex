/* eslint-disable react/prop-types */
import React from "react";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";

export default function NoticeChips({ createdAt, pinned }) {
  const isNew = (() => {
    if (!createdAt) return false;
    const d = new Date(createdAt);
    // 하루(1일 = 24시간) 기준으로 변경
    return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) <= 1;
  })();

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 1 }}>
      <Chip
        size="small"
        variant="outlined"
        color="info"
        icon={<CampaignOutlinedIcon />}
        label="공지"
      />
      {pinned ? <Chip size="small" variant="outlined" color="warning" label="고정" /> : null}
      {isNew ? <Chip size="small" variant="outlined" color="error" label="N" /> : null}
    </Stack>
  );
}
