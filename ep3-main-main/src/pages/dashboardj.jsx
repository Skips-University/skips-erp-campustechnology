import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: 14,
    background: '#007bff',
    border: 'none',
    color: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    marginRight: 8
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => navigate("/attendancej")} style={buttonStyle}>
        Go to Attendance
      </button>
      <button onClick={() => navigate("/allattendancej")} style={buttonStyle}>
        Go to All Attendance
      </button>
      <button onClick={() => navigate("/ipaddressj")} style={buttonStyle}>
        Go to IP Address
      </button>
      <button onClick={() => navigate("/salaryj")} style={buttonStyle}>
        Go to Salary 
      </button>
      <button onClick={() => navigate("/salarybysearchj")} style={buttonStyle}>Go to Salary Search</button>
      <button onClick={() => navigate("/leaves")} style={buttonStyle}>Go to Leaves</button>
      <button onClick={() => navigate("/setup")} style={buttonStyle}>Go to Setup</button>
      <button onClick={() => navigate("/salaryslipj")} style={buttonStyle}>Go to Salary Slip Search</button>
      <button onClick={() => navigate("/attendancebyemailj")} style={buttonStyle}>AttendanceByEmail</button>
      <button onClick={() => navigate("/deductionj")} style={buttonStyle}>Deduction</button>
    </div>
  );
};

export default Dashboard;
