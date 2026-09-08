export const studentDefaultMenuGroups = [
  { group: "Dashboard", items: [{ path: "/studentdashboard", title: "Student Dashboard" }] },
  { group: "Profile", items: [
    { path: "/studentprofiledynamic", title: "Profile" },
    { path: "/studentcompleteprofile", title: "Complete profile" },
    { path: "/userdocumentupload", title: "Upload documents" },
    { path: "/studentbankaccounts", title: "Bank account" },
    { path: "/studentadmissionprofile", title: "Admission profile" },
    { path: "/studentdynamicprofile", title: "Dynamic profile" },
    { path: "/userprofileprint", title: "Profile print" },
    { path: "/studentmentoringdetails", title: "Mentoring details" },
    { path: "/studentprofilelayoutdisplay", title: "Rolewise profile print" },
    { path: "/userconsent", title: "Give consent" },
    { path: "/userconsentwithdraw", title: "Withdraw consent" }
  ] },
  { group: "Academics", items: [
    { path: "/dashmclassenr1stud", title: "My classes" },
    { path: "/dashmclassnewstud", title: "Ongoing classes" }
  ] },
  { group: "NEP LMS", items: [
    { path: "/studentneplmsworkspace", title: "My NEP LMS" },
    { path: "/studentsequentialcontent", title: "Sequential Content" },
    { path: "/studentmyattendancesummary", title: "My Attendance Summary" },
    { path: "/studentneplmsotpattendance", title: "OTP Attendance" },
    { path: "/studentneplmslivequiz", title: "Live quiz" },
    { path: "/continuous-feedback-student", title: "Class feedback" },
    { path: "/studentelectiveapplication", title: "Elective Application" },
    { path: "/studentmyelectives", title: "My Electives" },
    { path: "/studentneplmsassessment", title: "Assessment" },
    { path: "/studentneplmsremedial", title: "Remedial" }
  ] },
  { group: "Mentoring", items: [{ path: "/studentmentoringworkspace", title: "My mentoring" }] },
  { group: "Alumni interaction", items: [
    { path: "/student/jobs", title: "Job dashboard" },
    { path: "/student/materials", title: "Study material" }
  ] },
  { group: "Student data", items: [
    { path: "/student/profile", title: "My data" },
    { path: "/studentprofiledsoct18", title: "My data edit" }
  ] },
  { group: "Hostel", items: [
    { path: "/dashboardhostelpagestud", title: "Hostel dashboard" },
    { path: "/studenthostelbedapply", title: "Apply for hostel bed" }
  ] },
  { group: "Fees payment", items: [
    { path: "/studentonlinefeepayment", title: "Pay fees online" },
    { path: "/studentonlinefeepayment2", title: "Pay fees online 2" },
    { path: "/studentmyonlinepaymentreport", title: "My online payments" },
    { path: "/studentinstallmentrequest", title: "Apply installment" }
  ] },
  { group: "Library New", items: [
    { path: "/student-library-issued", title: "My library books" },
    { path: "/student-library-opac", title: "Search library OPAC" }
  ] },
  { group: "Scholarship", items: [{ path: "/ApplyScholarshipDS", title: "Apply for scholarship" }] },
  { group: "Fees Ledger", items: [{ path: "/dashmledgerstudstud", title: "My Fees Ledger" }] },
  { group: "Certificates", items: [
    { path: "/studbonafide", title: "Bonafide certificate" },
    { path: "/studadmission", title: "Admission letter" }
  ] },
  { group: "Breakout rooms", items: [{ path: "/studentclassview", title: "My rooms" }] },
  { group: "Discussion Board", items: [{ path: "/studenttopicpageds", title: "Course Discussion" }] },
  { group: "Forum", items: [{ path: "/studenttopicpage1ds", title: "All Forum" }] },
  { group: "Examination", items: [
    { path: "/student-exam-registration", title: "Exam registration" },
    { path: "/student-exam-dynamic-form", title: "Dynamic exam form" },
    { path: "/examapply", title: "Apply for exam" },
    { path: "/examapply1", title: "Apply for exam 1" },
    { path: "/dashapplyadmitstud", title: "Student Registration form" },
    { path: "/dashmexamadmitstud", title: "My registration" },
    { path: "/dashadmitdownload", title: "Download admit card" },
    { path: "/student-admit-card-new", title: "Admit card new" },
    { path: "/dashmarksheet", title: "Download mark sheet" }
  ] },
  { group: "Reevaluation", items: [
    { path: "/reevaluationapplicationds", title: "Apply" },
    { path: "/reevaluation-application-new", title: "Apply New" }
  ] },
  { group: "Placement", items: [
    { path: "/studentcv", title: "My CV" },
    { path: "/jobs-apply", title: "Apply for job" }
  ] },
  { group: "My data", items: [
    { path: "/dashmscholnewstud", title: "Scholarships" },
    { path: "/dashmstudawardsnewstud", title: "Student awards" }
  ] },
  { group: "Settings", items: [
    { path: "/dashmpasswordstud", title: "Change password" },
    { path: "/studentpolicies", title: "Policy" }
  ] },
  { group: "Virtual lab", items: [
    { path: "/codeeditor", title: "Code editor" },
    { path: "/subhalfadder1", title: "Half adder 1" },
    { path: "/basiclogicgateexpfirst", title: "Logic gate 1" },
    { path: "/basiclogicgateexpsecond", title: "Logic gate 2" },
    { path: "/halfsubtractor", title: "Half Subtractor" },
    { path: "/fullsubtractor", title: "Full Subtractor" },
    { path: "/arrayvisualization", title: "Array visualization" },
    { path: "/stackvisualization", title: "Stack visualization" },
    { path: "/binarysearch", title: "Binary search" }
  ] },
  { group: "Virtual Lab Games", items: [
    { path: "/skeletonpart2game", title: "Skeleton Games 2" },
    { path: "/getmoldgame", title: "Get Mold" },
    { path: "/opticalfibregame", title: "Optical Fibre Game" },
    { path: "/tetrisgame", title: "Tetris game" },
    { path: "/sudokugame", title: "Sudoku game" }
  ] }
];

export const studentMenuFlatItems = studentDefaultMenuGroups.flatMap((group, groupIndex) =>
  group.items.map((item, itemIndex) => ({
    ...item,
    menugroup: group.group,
    id: `${group.group}|${item.path}`,
    order: groupIndex * 100 + itemIndex
  }))
);
