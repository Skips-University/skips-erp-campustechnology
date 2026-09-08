import React from "react";
import HrLeaveManagementPage from "./HrLeaveManagementPage";

export default function HrLeaveApprovePage() {
  return (
    <HrLeaveManagementPage
      defaultTab="approve"
      singlePage
      pageTitle="Leave Approve"
      pageSubtitle="Review pending leave requests, class conflicts, and approve or reject with comments."
    />
  );
}
