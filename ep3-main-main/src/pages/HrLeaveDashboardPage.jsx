import React from "react";
import HrLeaveManagementPage from "./HrLeaveManagementPage";

export default function HrLeaveDashboardPage() {
  return (
    <HrLeaveManagementPage
      defaultTab="dashboard"
      singlePage
      pageTitle="Leave Dashboard"
      pageSubtitle="View leave balances, pending leaves, monthwise trends, and leave history."
    />
  );
}
