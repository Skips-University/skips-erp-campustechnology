import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WorkIcon from "@mui/icons-material/Work";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626", "#0f766e", "#ca8a04", "#be185d"];

const modules = [
  {
    title: "User Management And Employee Master",
    icon: <BadgeIcon />,
    summary: "Create, govern, enrich, approve, and print role-based employee and student profiles.",
    links: [
      ["/userdataupload", "User data upload"],
      ["/usercustomfields", "User custom fields"],
      ["/userprofilelayout", "Profile layout"],
      ["/userprofiledisplaylayout", "Profile display layout"],
      ["/userprofileedit", "Profile edit"],
      ["/userprofileapproval", "Profile edit approval"],
      ["/userprofileapprovalstudent", "User profile approval"],
      ["/userprofileapprovalreport", "Profile edit report"],
      ["/userprofileprint", "Profile print"],
      ["/userdocumentrequirements", "Document requirements"],
      ["/userdocumentupload", "Document upload"],
      ["/useracademicdetails", "Academic details"],
      ["/useremploymentdetails", "Employment details"],
      ["/userfullprofile", "Admin profile view"],
      ["/myfullprofile", "My profile"],
      ["/userconsentcontent", "Consent form setup"],
      ["/userconsent", "Give consent"],
      ["/userconsentwithdraw", "Withdraw consent"],
      ["/userconsentauditlog", "Consent audit log"]
    ],
    workflow: [
      "Configure custom fields and rolewise profile layout before data collection.",
      "Upload or create users with mandatory HR, contact, academic, employment, and document data.",
      "Employees update editable profile fields and upload documents.",
      "Approvers review pending profile fields/documents with comments before changes are finalized.",
      "HR prints rolewise profile records using the display layout and maintains audit/consent evidence."
    ],
    businessCases: [
      "Single source of truth for employee records, contracts, academic qualifications, employment history, and statutory IDs.",
      "Controlled self-service profile edits with field-level approval and audit trail.",
      "Compliance-ready consent tracking for data processing under institutional policy."
    ]
  },
  {
    title: "Organization Hierarchy",
    icon: <GroupsIcon />,
    summary: "Maintain employee-manager relationships and generate department or institution org charts.",
    links: [
      ["/organizationhierarchy", "Organization hierarchy"],
      ["/departmentalorgchart", "Departmental org chart"],
      ["/institutionorgchart", "Institution Org Chart"],
      ["/employeereporting", "Employee reporting"]
    ],
    workflow: [
      "Select an employee and assign one or more managers from the searchable non-student user list.",
      "Capture department context for employee and manager relationships.",
      "Use dynamic filters or bulk upload to maintain the reporting matrix at scale.",
      "Generate graphical org charts with institution logo, name, and address for department, whole institution, or selected employee reporting lines."
    ],
    businessCases: [
      "Manager-based approval routing for expenses and future HR workflows.",
      "Department-wise governance visibility for leadership and auditors.",
      "Printable reporting hierarchy for administrative files."
    ]
  },
  {
    title: "Leave Management",
    icon: <CalendarMonthIcon />,
    summary: "Configure leave rules, apply/approve leave, track balances, and handle compensatory leave.",
    links: [
      ["/hrleavehierarchy", "Approval hierarchy"],
      ["/hrleavetypes", "Leave type master"],
      ["/hrleavecycle", "Leave cycle"],
      ["/hrleavebalance", "Leave balance"],
      ["/hrleavereset", "Leave reset"],
      ["/hrleaveapply", "Apply leave"],
      ["/hrleaveapprove", "Approve leave"],
      ["/hrleavedashboard", "Leave dashboard"],
      ["/hrleavehrdashboard", "HR leave dashboard"],
      ["/hrleavecomprule", "Compensatory leave rule"],
      ["/hrleaveweeklyoff", "Weekly off"],
      ["/hrleavecompbalance", "Compensatory leave balance"]
    ],
    workflow: [
      "Define approval hierarchy, leave types, leave cycle, carry-forward rules, EL/Non-EL behavior, and opening balances.",
      "Configure weekly off days and compensatory leave rules rolewise.",
      "When an employee applies for leave, the system checks balance, overlap, approved/pending applications, classes assigned, and document links.",
      "Applicants provide alternate plans for affected classes, visible to approvers.",
      "Approvers approve/reject with comments. Final approval deducts leave; rejection restores balance.",
      "Leave reset carries forward EL as per rule and resets Non-EL according to configured quota."
    ],
    businessCases: [
      "Transparent employee leave lifecycle with balance control.",
      "Academic continuity through alternate class plan capture.",
      "HR dashboard for cycle-wise applied, approved, rejected, monthwise leave, and carry-forward analysis."
    ]
  },
  {
    title: "Attendance Management",
    icon: <CheckCircleIcon />,
    summary: "Record employee attendance, approve changes, and integrate absence with leave and salary deduction.",
    links: [
      ["/hremployeeattendance", "Employee attendance"],
      ["/hremployeeattendancematrix", "Attendance approval matrix"],
      ["/hremployeeattendanceapproval", "Attendance approval"]
    ],
    workflow: [
      "Create employee attendance by academic year, month, date, employee, attendance value, and status.",
      "Added or edited attendance goes through the configured approval matrix.",
      "Approval screen supports bulk approval and separates pending and approved records.",
      "For absences, the system checks approved leave or compensatory leave, weekly off, and holidays before salary impact.",
      "If no eligible leave/off-day exists, CL is deducted if available; otherwise one-day LOP deduction is posted to salary."
    ],
    businessCases: [
      "Prevents direct payroll impact from unapproved attendance changes.",
      "Connects attendance, leave, and salary into one auditable flow.",
      "Supports bulk upload and template-based operational processing."
    ]
  },
  {
    title: "HR Expense",
    icon: <ReceiptLongIcon />,
    summary: "Submit multi-item employee expense claims with AWS documents, validation, approval, and salary posting.",
    links: [
      ["/hrexpenseworkflow", "Expense approval workflow"],
      ["/hrexpenserules", "Expense validation rules"],
      ["/hrexpensesubmit", "Submit expense"],
      ["/hrexpenseapproval", "Expense approval"],
      ["/hrexpensestatus", "Expense status"],
      ["/hrexpensereport", "Expense report"]
    ],
    workflow: [
      "Configure approval levels. Levels may use explicit approvers or the manager from Organization hierarchy.",
      "Configure rolewise mandatory and optional validation rules for expense data and documents.",
      "Employee submits one expense claim containing multiple items such as travel, food, accommodation, office, medical, or other expenses.",
      "Bills and supporting documents are uploaded to AWS and linked with each item.",
      "Approvers select an employee submission, review all items, approve/reject all or selected items, adjust approved amount, and add remarks.",
      "After final approval, approved expense amount is posted into `hrsalary` as an earning entry and appears in salary register processing."
    ],
    businessCases: [
      "Structured reimbursement workflow with document trail.",
      "Policy-led validation before approval.",
      "Approved reimbursements become part of salary/payroll register without duplicate data entry."
    ]
  },
  {
    title: "Salary, Payroll And Employee Ledger",
    icon: <PaymentsIcon />,
    summary: "Generate salary, submit monthly salary sheets, approve payments, create vouchers, and maintain employee ledger.",
    links: [
      ["/dashmhrstructure", "Salary structure"],
      ["/ugcseventhpaystructure", "UGC seventh pay structure"],
      ["/dashmhrsalstructure", "Employee salary structure"],
      ["/dashmhrsalary", "Employee salary"],
      ["/salassign1", "Employee Salary generator 2"],
      ["/salarytransfer", "Populate salary"],
      ["/populatearrear", "Populate arrear"],
      ["/salarypivot1", "Monthwise salary sheet drill down"],
      ["/salarypaymentworkflow", "Salary payment workflow"],
      ["/salarysheetapproval", "Salary sheet approval"],
      ["/employeeledgernew", "Employee ledger new"],
      ["/myemployeeledger", "My ledger"],
      ["/employeesalaryregister", "Employee salary register"],
      ["/mysalaryregister", "My salary register"],
      ["/hrsalarycomponentreport", "Salary component report"],
      ["/hrsalaryslip", "Salary slip"],
      ["/mysalaryslip", "My salary slip"],
      ["/hrform16", "Form 16"],
      ["/hrcompanytaxdetails", "Company PAN TAN"],
      ["/hremployeepan", "Employee PAN"],
      ["/hrtdsdeposited", "TDS deposited"],
      ["/visitingfaculty", "Visiting faculty"],
      ["/visitingfacultyregister", "Visiting faculty register"],
      ["/visitingfacultypay", "Visiting faculty pay"],
      ["/hrresignation", "Resignation"],
      ["/hrresignationreport", "Resignation report"]
    ],
    workflow: [
      "Define salary structures, salary components, employee salary structures, statutory details, and employee PAN/TDS details.",
      "Populate salary monthwise from salary structures, attendance, LOP, arrears, and expense reimbursements.",
      "Use Salary Pivot 1 to view the month/year salary sheet and submit it for approval.",
      "Salary sheet approval follows the salary payment workflow.",
      "After sheet approval, create a payment voucher. The voucher can split the due amount across multiple payments with date, mode, reference, and description.",
      "Voucher approval follows its own approval workflow. Final approval posts payment entries to Employee Ledger New and marks monthly salary rows paid.",
      "Employee salary register and my salary register provide MUI grid reports, cards, charts, export, and print views."
    ],
    businessCases: [
      "End-to-end salary disbursement control from generation to voucher approval.",
      "Employee-wise ledger statement for payment audit and employee self-service.",
      "Statutory-ready salary slip, Form 16, PAN/TAN, and TDS deposit records."
    ]
  },
  {
    title: "Recruitment",
    icon: <WorkIcon />,
    summary: "Create jobs, custom forms, candidate applications, AI-assisted validation/shortlisting, interview panels, and schedules.",
    links: [
      ["/recruitment-management", "Recruitment module"],
      ["/recruitment-interview-panels", "Interview panels"],
      ["/recruitment-panel-members", "Panel members"],
      ["/recruitment-panel-jobs", "Panel job mapping"],
      ["/recruitment-interview-schedule", "Interview schedule"],
      ["/recruitment-apply", "Public recruitment apply"]
    ],
    workflow: [
      "Create job postings with employment type, form assignment, status, and public share link.",
      "Build dynamic recruitment forms with tabs, fields, photo/document upload, and validation criteria.",
      "Applicants submit public applications. Mandatory validation can block submission; optional validation records deficiencies.",
      "Recruitment users review candidates, change status, trigger mail communication, and shortlist using dynamic filters or AI instructions.",
      "Create interview panels, add members with qualifications/remuneration, map panels to jobs, and schedule candidate interviews.",
      "Interview scheduling can show panel member class schedules for the selected date to avoid conflicts."
    ],
    businessCases: [
      "Role-ready recruitment pipeline for faculty and staff hiring.",
      "Configurable application data capture without code changes.",
      "AI-assisted screening and validation while preserving human approval decisions."
    ]
  }
];

const quickStart = [
  "Set institution details, AWS, Email, AI/Ollama configuration from Settings.",
  "Create user data, custom fields, document requirements, consent content, and organization hierarchy.",
  "Configure leave, attendance, salary, and expense workflows before operational use.",
  "Use employee self-service pages for leave, profile update, document upload, expense submission, salary slips, and ledger statements.",
  "Use admin dashboards/reports to review approvals, payroll, expenses, org charts, leave status, attendance, and recruitment activity."
];

const businessMapping = [
  {
    title: "Employee Lifecycle",
    text: "User master, custom fields, academic/employment history, documents, consent, profile approval, resignation, and full profile print cover the employee record from joining to exit."
  },
  {
    title: "Workforce Availability",
    text: "Leave, attendance, weekly off, compensatory leave, class-impact checks, alternate plans, and dashboards help HR know who is available and how academic continuity is protected."
  },
  {
    title: "Payroll Governance",
    text: "Salary generation, LOP, earned leave, arrears, expense reimbursement, salary sheet approval, vouchers, employee ledger, salary slips, Form 16, and TDS pages create a controlled payroll cycle."
  },
  {
    title: "Talent Acquisition",
    text: "Recruitment forms, validation, AI shortlisting, status tracking, panels, interview schedules, candidate email, and conflict-aware scheduling support hiring governance."
  },
  {
    title: "Compliance And Audit",
    text: "Profile audit, consent audit, leave approval comments, attendance approval, expense validation, payroll vouchers, document links, and printable reports preserve institutional evidence."
  },
  {
    title: "Employee Self-Service",
    text: "Employees can edit profile, upload documents, apply leave, submit expenses, view salary slip, check ledger, and see leave balance without HR re-entering routine data."
  }
];

export default function HrHelpPage() {
  const moduleChartData = modules.map((module) => ({
    name: module.title.replace(" Management", "").replace(" And Employee Master", ""),
    pages: module.links.length,
    steps: module.workflow.length,
    useCases: module.businessCases.length
  }));

  return (
    <MenuPageShell title="HR Help">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
        <Stack spacing={3}>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, border: "1px solid #dbeafe" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
              <Box sx={{ width: 58, height: 58, borderRadius: 2, bgcolor: "#1d4ed8", color: "#fff", display: "grid", placeItems: "center" }}>
                <ArticleIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900}>Human Resource Modules Help Guide</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 980, mt: 0.5 }}>
                  This guide explains how the HR-related modules work together: user master data, leave, attendance, expenses, salary, organization hierarchy, and recruitment.
                  It is designed for administrators, HR officers, accounts users, approvers, faculty, and employees who need both operational steps and business context.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Grid container spacing={2}>
            {[
              ["Core HR", "Employee data, hierarchy, profile, documents, consent"],
              ["Workforce Operations", "Leave, attendance, compensatory leave, dashboards"],
              ["Payroll And Claims", "Salary sheets, vouchers, ledger, expense reimbursement"],
              ["Talent Acquisition", "Recruitment forms, candidates, interviews, shortlisting"]
            ].map(([title, text]) => (
              <Grid item xs={12} md={3} key={title}>
                <Card sx={{ height: "100%", borderTop: "4px solid #2563eb" }}>
                  <CardContent>
                    <Typography fontWeight={900}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, borderRadius: 2, height: 330 }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>HR Module Coverage</Typography>
                <ResponsiveContainer width="100%" height="86%">
                  <BarChart data={moduleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="pages" fill="#2563eb" name="Direct pages" />
                    <Bar dataKey="steps" fill="#16a34a" name="Workflow steps" />
                    <Bar dataKey="useCases" fill="#f97316" name="Business use cases" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, borderRadius: 2, height: 330 }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Operational Emphasis</Typography>
                <ResponsiveContainer width="100%" height="86%">
                  <PieChart>
                    <Pie data={moduleChartData} dataKey="pages" nameKey="name" outerRadius={96} label>
                      {moduleChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Business Use Case Mapping</Typography>
            <Grid container spacing={2}>
              {businessMapping.map((item, index) => (
                <Grid item xs={12} md={4} key={item.title}>
                  <Card sx={{ height: "100%", borderLeft: `5px solid ${colors[index % colors.length]}`, borderRadius: 2 }}>
                    <CardContent>
                      <Typography fontWeight={900}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.55 }}>
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={900}>Recommended Setup Sequence</Typography>
            <List dense>
              {quickStart.map((item, index) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={`${index + 1}. ${item}`} primaryTypographyProps={{ color: "#111827" }} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {modules.map((module) => (
            <Paper key={module.title} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #e5e7eb" }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} sx={{ mb: 2 }}>
                <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: "#eff6ff", color: "#1d4ed8", display: "grid", placeItems: "center" }}>{module.icon}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={900}>{module.title}</Typography>
                  <Typography color="text.secondary">{module.summary}</Typography>
                </Box>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Typography fontWeight={900} sx={{ mb: 1 }}>Workflow</Typography>
                  <List dense>
                    {module.workflow.map((step, index) => (
                      <ListItem key={step} disableGutters alignItems="flex-start">
                        <ListItemText primary={`${index + 1}. ${step}`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography fontWeight={900} sx={{ mb: 1 }}>Business Use Cases</Typography>
                  <Stack spacing={1}>
                    {module.businessCases.map((item) => <Chip key={item} label={item} sx={{ height: "auto", py: 0.7, "& .MuiChip-label": { whiteSpace: "normal" } }} />)}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography fontWeight={900} sx={{ mb: 1 }}>Direct Navigation</Typography>
                  <Stack spacing={1}>
                    {module.links.map(([to, label]) => (
                      <Button key={to} component={RouterLink} to={to} variant="outlined" size="small" sx={{ justifyContent: "flex-start", textAlign: "left", textTransform: "none" }}>
                        {label}
                      </Button>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Tip: use workflow pages before transaction pages. Example: define approvers before salary sheet, leave, profile, or expense approvals are submitted.
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
