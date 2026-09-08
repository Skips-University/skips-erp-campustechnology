import React, { useState } from "react";
import ep1 from "../api/ep1";

export default function SalarySearch() {
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSearch = async () => {
    if (!email) {
      setMsg("Please enter an email");
      return;
    }
    setLoading(true);
    setMsg("");
    setSalary(null);
    try {
      const { data } = await ep1.get(`/api/v2/getsalarybyemailj?email=${email}`);
      if (data) {
        setSalary(data);
      } else {
        setMsg("No salary found for this email");
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Error fetching salary");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      background: "#f8f9fa",
      padding: "40px 20px"
    }}>
      <div style={{
        width: "700px",
        background: "#fff",
        padding: "25px 35px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "25px", color: "#343a40" }}>Search Salary</h1>

        {/* Search Section */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
              fontSize: "14px"
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {msg && <p style={{ color: "#dc3545", marginBottom: "15px" }}>{msg}</p>}

        {/* Salary Details */}
        {salary && (
          <div style={{
            border: "1px solid #dee2e6",
            padding: "20px",
            borderRadius: "10px",
            background: "#f1f3f5"
          }}>
            <h3 style={{ marginBottom: "15px", color: "#495057" }}>Salary Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div><strong>Name:</strong> {salary.name}</div>
              <div><strong>Email:</strong> {salary.email}</div>
              <div><strong>Col ID:</strong> {salary.colid}</div>
              <div><strong>Transaction Type:</strong> {salary.transactionType}</div>
              <div><strong>Description:</strong> {salary.description}</div>
              <div><strong>basicPay:</strong> {salary.basicPay}</div>
              <div><strong>allowances:</strong> {salary.allowances}</div>
              <div><strong>deductions:</strong> {salary.deductions}</div>
              <div><strong>grossSalary:</strong> {salary.grossSalary}</div>
              <div><strong>netSalary:</strong> {salary.netSalary}</div>
              <div><strong>Month:</strong> {salary.month}</div>
              <div><strong>Year:</strong> {salary.year}</div>
              <div><strong>Status:</strong> {salary.status}</div>
              <div><strong>Transaction ID:</strong> {salary.transactionId}</div>
            </div>

            {/* Payslips */}
            {salary.payslips?.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4>Payslips</h4>
                <ul>
                  {salary.payslips.map((file, index) => (
                    <li key={index}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
