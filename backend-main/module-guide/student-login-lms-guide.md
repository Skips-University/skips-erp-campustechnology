# Student Login and LMS Module Guide

This guide explains the current student login flow and the files to use when building or extending the LMS student module.

## 1. Current File Map

### Backend login files

| Purpose | File |
|---|---|
| Main web login route | `backend-main/router/loginroute.js` |
| Institution-specific login route | `backend-main/router/logincolrouter.js` |
| Login page and web-session login logic | `backend-main/controllers/addusercontroller.js` |
| Student API login controller | `backend-main/controllers/facapicontroller.js` |
| Legacy student login controller | `backend-main/controllers/apicontroller.js` |
| Main backend route registration | `backend-main/app.js` |
| Student database model | `backend-main/Models/user.js` |

### Backend LMS files

| Purpose | File |
|---|---|
| Student dashboard aggregation | `backend-main/controllers/neplmsstudentdashboardctlrds.js` |
| Student course and material workspace | `backend-main/controllers/neplmsstudentworkspacectlrds.js` |
| LMS resources, timetable and common LMS operations | `backend-main/controllers/neplmsctlrds.js` |
| Lesson content and progress | `backend-main/controllers/neplmslessoncontentctlrds.js` |
| LMS quizzes and quiz attempts | `backend-main/controllers/neplmsquizctlrds.js` |
| Descriptive assessments | `backend-main/controllers/neplmsdescriptiveassessmentctlrds.js` |
| Student dashboard route registration | `backend-main/app.js` |

### Frontend files

| Purpose | File |
|---|---|
| Student login screen | `ep3-main-main/src/pages/Loginstud.js` |
| LMS student dashboard screen | `ep3-main-main/src/pages/NepLmsStudentDashboardPage.jsx` |
| API client/base URL | `ep3-main-main/src/api/ep1.js` and `ep3-main-main/src/api/socketurl.js` |
| Shared logged-in user state | `ep3-main-main/src/pages/global1.js` |

## 2. Current Student Login Flow

The current React student login flow is:

1. The user opens the frontend route `/loginstud`.
2. `ep3-main-main/src/pages/Loginstud.js` sends the credentials to:

   ```http
   GET /api/v1/loginapi?email=<email>&password=<password>
   ```

3. `backend-main/app.js` maps this endpoint to `facapicontroller.loginapi`.
4. On success, the frontend stores values such as `colid`, `regno`, `semester`, `section`, `programcode`, `role`, and `token` in `global1`.
5. The frontend navigates the student to `/studentdashboard`.
6. The LMS dashboard calls:

   ```http
   GET /api/v2/neplms/student-dashboard?colid=<colid>&regno=<regno>
   ```

7. `neplmsstudentdashboardctlrds.getStudentDashboard` loads the student, courses, attendance, resources, timetable, assignments, quizzes, and lesson content.

There is also an older login path:

```http
GET /api/v1/loginstud?email=<email>&password=<password>
```

This is registered in `backend-main/app.js` and handled by `backend-main/controllers/apicontroller.js`. Use the newer `loginapi` flow for new frontend work unless compatibility with the older client is required.

## 3. LMS Student Dashboard API

### Request

```http
GET /api/v2/neplms/student-dashboard
```

Required query parameters:

| Parameter | Description |
|---|---|
| `colid` | Institution/college identifier |
| `regno` | Student registration number |

Optional filters are taken from the student record or query string, including `academicyear`, `program`, `programcode`, `regulation`, `semester`, and `major`.

Example:

```http
GET /api/v2/neplms/student-dashboard?colid=101&regno=STU001&semester=3
```

### Successful response shape

```json
{
  "success": true,
  "semesterOptions": ["1", "2", "3"],
  "student": {
    "name": "Student Name",
    "regno": "STU001",
    "email": "student@example.com",
    "programcode": "BCA",
    "semester": "3",
    "section": "A"
  },
  "summary": {
    "courses": 4,
    "upcomingAssignments": 2,
    "upcomingQuizzes": 1,
    "attendancePercentage": 82.5
  },
  "courses": [],
  "attendance": [],
  "upcomingClasses": [],
  "pastClasses": [],
  "upcomingAssignments": [],
  "upcomingQuizzes": [],
  "courseMaterial": [],
  "quizAttempts": [],
  "submissions": []
}
```

### Backend dashboard behavior

`getStudentDashboard`:

- Finds the student using `colid` and `regno`.
- Finds active courses using the student's academic details.
- Loads attendance, resources, timetable, assignment submissions, quizzes, quiz attempts, and lesson content in parallel.
- Filters timetable rows by the student's section.
- Calculates attendance percentage and activity counts.
- Returns course-level activity grouped into assignments, course materials, quizzes, lesson plans, and sequences.

## 4. Recommended Implementation Steps

### Step 1: Confirm the student data

A student record in `backend-main/Models/user.js` should contain at least:

- `email`
- `password` or a password hash
- `role` equal to `Student`
- `colid`
- `regno`
- `name`
- `semester`
- `section`
- `programcode`
- Academic-year and program fields used by the LMS course query

The LMS course records must use matching values for `colid`, `academicyear`, `semester`, and `coursecode`.

### Step 2: Use one authentication contract

For new work, keep authentication in the login API controller and return a signed token plus the minimum student profile fields needed by the frontend.

Recommended request:

```http
POST /api/v2/auth/student-login
Content-Type: application/json
```

```json
{
  "email": "student@example.com",
  "password": "student-password"
}
```

Recommended success response:

```json
{
  "success": true,
  "token": "<signed-token>",
  "student": {
    "id": "<user-id>",
    "name": "Student Name",
    "email": "student@example.com",
    "colid": 101,
    "regno": "STU001",
    "role": "Student",
    "semester": "3",
    "section": "A",
    "programcode": "BCA"
  }
}
```

Do not send passwords in query strings. Query strings can be stored in browser history, reverse-proxy logs, and server logs.

### Step 3: Protect LMS routes

Add authentication middleware to student LMS routes. The middleware should:

1. Read the bearer token from the `Authorization` header.
2. Verify the token using `JWT_SECRET`.
3. Load the user from the database or use verified token claims.
4. Confirm the user role is `Student` for student-only routes.
5. Use the authenticated user's `colid` and `regno` instead of trusting values supplied by the browser.

Example request after authentication:

```http
GET /api/v2/neplms/student-dashboard?semester=3
Authorization: Bearer <signed-token>
```

The backend should derive `colid` and `regno` from the token/session. This prevents one student from requesting another student's dashboard by changing query parameters.

### Step 4: Connect the frontend dashboard

In `NepLmsStudentDashboardPage.jsx`:

1. Read the authenticated token and student identity from the shared auth state.
2. Call `/api/v2/neplms/student-dashboard`.
3. Show loading and error states.
4. Render the student profile and summary cards.
5. Render courses and their activities.
6. Add navigation to the student workspace for course materials, assignments, quizzes, and lesson content.
7. Refresh data after assignment or quiz submission.

### Step 5: Add student workspace features

Use the existing routes for detailed LMS actions:

```http
GET  /api/v2/neplms/student-workspace/courses
GET  /api/v2/neplms/student-workspace/course
GET  /api/v2/neplms/student-workspace/course-materials
POST /api/v2/neplms/student-workspace/course-material-progress
POST /api/v2/neplms/student-workspace/course-material-question
POST /api/v2/neplms/student-workspace/course-material-answer
POST /api/v2/neplms/student-workspace/assignment-submit
GET  /api/v2/neplms/student-workspace/lesson-content
POST /api/v2/neplms/student-workspace/lesson-content-complete
GET  /api/v2/neplms/student-workspace/active-quizzes
POST /api/v2/neplms/student-workspace/quiz-submit
GET  /api/v2/neplms/student-workspace/active-assessments
POST /api/v2/neplms/student-workspace/assessment-submit
```

Check the corresponding controller before adding a new endpoint. Several student workspace operations already exist.

## 5. Security and Reliability Checklist

- Replace plaintext password comparison with a strong password hash such as bcrypt.
- Do not use `GET` for login credentials.
- Do not expose passwords, password hashes, or unnecessary user fields in responses.
- Protect dashboard and workspace endpoints with JWT/session authentication.
- Derive `colid`, `regno`, and role from authenticated identity.
- Use short-lived access tokens and a refresh-token strategy where appropriate.
- Apply rate limiting to login attempts.
- Return `401` for missing/invalid authentication and `403` for an authenticated user without permission.
- Validate `colid`, `regno`, semester, and all IDs before database queries.
- Add indexes for common LMS queries such as `colid + regno` and `colid + coursecode`.
- Log authentication failures without logging passwords or authorization headers.
- Keep `JWT_SECRET` and database credentials in environment variables; never commit them.

## 6. Testing Checklist

### Login tests

- Valid student credentials return a token and student profile.
- Invalid credentials return `401`.
- Faculty/admin credentials cannot use student-only endpoints.
- Missing email or password returns a validation error.
- Login rate limiting works after repeated failures.

### Dashboard tests

- A valid student sees only their own dashboard.
- An unknown `regno` returns `404`.
- A student cannot change `colid` or `regno` in the URL to view another student.
- A student with no courses receives an empty course list and a valid summary.
- Attendance percentage is correct for present and absent rows.
- Assignments and quizzes already submitted/attempted are not shown as upcoming.
- Timetable results respect the student's section.

### Frontend tests

- Login shows validation and server errors.
- Successful login redirects to `/studentdashboard`.
- Dashboard has loading, empty, and error states.
- Expired authentication redirects to the login page.
- Assignment and quiz submission refreshes the relevant dashboard state.

## 7. Quick Development Verification

Start the backend from `backend-main`:

```powershell
npm start
```

Then verify the API with an authenticated request. Do not put a real password in shell history or documentation.

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v2/neplms/student-dashboard?colid=101&regno=STU001" `
  -Headers @{ Authorization = "Bearer <token>" }
```

The response should contain `success: true`, the student profile, summary values, and LMS collections.
