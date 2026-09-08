import React, { useState } from "react";
import ep1 from "../api/ep1"; // axios instance
import global1 from "./global1";

export default function AddSalaryForm() {
  const colid = global1.colid || "";
  const [form, setForm] = useState({
    name: "",
    email: "",
    colid: colid,
    transactionType: "bonus",
    description: "",
    basicPay: "",
    allowances: "",
    deductions: "",
    grossSalary: "",
    netSalary: "",
    month: "",
    year: "",
    transactionId: "",
    status: "pending"
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveSalary = async () => {
    try {
      setLoading(true);
      const { data } = await ep1.post("/api/v2/addsalaryj", form);
      setMsg(data?.message || "Salary added successfully");
      resetForm();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error adding salary");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      colid: colid,
      transactionType: "bonus",
      description: "",
      basicPay: "",
      allowancess: "",
      deductions: "",
      grossSalary: "",
      netSalary: "",
      month: "",
      year: "",
      transactionId: "",
      status: "pending"
    });
  };

  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#e9ecef",
      padding: "15px"
    }}>
      <div style={{
        width: "550px",
        background: "#fff",
        padding: "18px",
        borderRadius: "10px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "18px", color: "#343a40" }}>Add Salary Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px"
          }}
        >
          {[
            { type: "input", label: "Name", name: "name" },
            { type: "input", label: "Email", name: "email" },
            {
              type: "select",
              label: "Transaction Type",
              name: "transactionType",
              options: [
                { value: "salary_payment", text: "Salary Payment" },
                { value: "bonus", text: "Bonus" },
                { value: "adjustment", text: "Adjustment" },
                { value: "deduction", text: "Deduction" }
              ]
            },
            { type: "input", label: "Description", name: "description" },
            { type: "input", label: "Basic Pay", name: "basicPay" },
            { type: "input", label: "allowances", name: "allowances" },
            { type: "input", label: "Deductions", name: "deductions" },
            { type: "input", label: "Gross Salary", name: "grossSalary" },
            { type: "input", label: "Net Salary", name: "netSalary" },
            {
              type: "select",
              label: "Month",
              name: "month",
              options: Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                text: new Date(0, i).toLocaleString("default", { month: "long" })
              }))
            },
            { type: "input", label: "Year", name: "year" },
            { type: "input", label: "Transaction ID", name: "transactionId" },
            {
              type: "select",
              label: "Status",
              name: "status",
              options: [
                { value: "pending", text: "Pending" },
                { value: "completed", text: "Completed" }
              ]
            }
          ].map((field) => (
            <div
              key={field.name}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  marginBottom: "5px",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "14px"
                }}
              >
                {field.label}
              </label>

              {field.type === "input" ? (
                <input
                  name={field.name}
                  placeholder={field.label}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  style={{
                    padding: "7px",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                    fontSize: "10px",
                    outline: "none",
                    transition: "border-color 0.3s"
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#007bff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#ced4da")}
                />
              ) : (
                <select
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  style={{
                    padding: "7px",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                    fontSize: "10px",
                    outline: "none",
                    transition: "border-color 0.3s"
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#007bff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#ced4da")}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>


        <button
          onClick={saveSalary}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "80%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = "#0056b3"}
          onMouseOut={e => e.currentTarget.style.backgroundColor = "#007bff"}
        >
          {loading ? "Saving..." : "Add Salary"}
        </button>

        {msg && <p style={{ marginTop: "10px", textAlign: "center", color: "#28a745", fontWeight: 500 }}>{msg}</p>}
      </div>
    </div>
  );
}
