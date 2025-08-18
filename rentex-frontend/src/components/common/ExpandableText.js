import { useState } from "react";
import { Button, Typography } from "@mui/material";

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

export default ExpandableText;
