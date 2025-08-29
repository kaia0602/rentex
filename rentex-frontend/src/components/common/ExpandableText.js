import { useState } from "react";
import { Button, Typography } from "@mui/material";
import PropTypes from "prop-types";

function ExpandableText({ text, limit = 250 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = expanded ? text : text.slice(0, limit) + (isLong ? "..." : "");

  return (
    <div>
      <Typography variant="body2" style={{ whiteSpace: "pre-line" }}>
        {displayText}
      </Typography>
      {isLong && (
        <Button onClick={() => setExpanded(!expanded)} size="small" sx={{ mt: 1 }}>
          {expanded ? "접기 ▲" : "더보기 ▼"}
        </Button>
      )}
    </div>
  );
}

// ✅ PropTypes 정의
ExpandableText.propTypes = {
  text: PropTypes.string.isRequired, // text는 필수 문자열
  limit: PropTypes.number, // limit은 숫자 (기본값 250)
};

export default ExpandableText;
