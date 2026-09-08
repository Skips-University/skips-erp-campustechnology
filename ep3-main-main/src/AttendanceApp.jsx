import React from "react";
import { Routes, Route } from "react-router-dom";
import AttendanceNav from "./AttendanceNav";
import UploadPage from "./pages/UploadPage";


export default function AttendanceApp() {
  return (
    <Routes>
      {/* This matches /attendance and renders AttendanceNav */}
      <Route path="/" element={<AttendanceNav />}>
        {/* Default page for /attendance */}
        <Route index element={<UploadPage />} />
        
        {/* These are now relative to /attendance */}
        <Route path="upload" element={<UploadPage />} />
        
      </Route>
    </Routes>
  );
}
