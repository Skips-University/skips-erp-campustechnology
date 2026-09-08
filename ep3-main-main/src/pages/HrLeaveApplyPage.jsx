import React from "react";
import HrLeaveManagementPage from "./HrLeaveManagementPage";

export default function HrLeaveApplyPage() {
  return (
    <HrLeaveManagementPage
      defaultTab="apply"
      singlePage
      pageTitle="Leave Apply"
      pageSubtitle="Apply for leave, check assigned classes, and submit supporting details."
    />
  );
}
