import React, { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function ActivityPointBadge({ sx = {} }) {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const res = await ep1.get("/api/v2/activity-monitoring/user-points", {
          params: { colid: global1.colid, useremail: global1.user, limit: 5000 }
        });
        const total = (res.data?.data || []).reduce((sum, row) => sum + Number(row.points || 0), 0);
        setPoints(total);
      } catch {
        setPoints(0);
      }
    };
    if (global1?.colid && global1?.user) loadPoints();
  }, []);

  return (
    <Chip
      size="small"
      label={`Activity point: ${points}`}
      sx={{
        bgcolor: "#fff8e1",
        color: "#4e342e",
        border: "1px solid rgba(255,255,255,0.75)",
        fontWeight: 800,
        height: 32,
        maxWidth: 220,
        "& .MuiChip-label": { px: 1.25, whiteSpace: "nowrap" },
        ...sx
      }}
    />
  );
}
