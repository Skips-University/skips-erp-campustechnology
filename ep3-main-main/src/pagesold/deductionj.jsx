import React, { useState } from "react";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function Deduction() {
  const colid = global1.colid || 0;

  // -----------------
  // State
  // -----------------
  const [form, setForm] = useState({
    email: "",
    deductionName: "",
    deductionAmount: "",
    colid: Number(colid),
  });

  const [searchEmail, setSearchEmail] = useState("");
  const [results, setResults] = useState([]); // full list from API
  const [page, setPage] = useState(1); // client-side pagination page
  const [pageSize] = useState(25); // items per page

  const [updateForm, setUpdateForm] = useState(null); // when editing a row

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // -----------------
  // Helpers
  // -----------------
  const idOf = (row) => row?._id || row?.id; // tolerate either _id or id

  const normalizeList = (data) => {
    // Accept a few common shapes to avoid "not working" due to response shape
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.deductions)) return data.deductions;
    if (Array.isArray(data?.deduction)) return data.deduction;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const safeNumber = (v) => (v === "" || v === null || Number.isNaN(Number(v)) ? "" : Number(v));

  // -----------------
  // Add (Create)
  // -----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "deductionAmount" || name === "colid" ? safeNumber(value) : value,
    }));
  };

  const saveDeduction = async () => {
    if (!form.email.trim() || !form.deductionName.trim() || form.deductionAmount === "") {
      setMsg("Please fill in all fields");
      return;
    }
    if (Number(form.deductionAmount) <= 0) {
      setMsg("Enter a valid deduction amount");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const { data } = await ep1.post("/api/v2/adddeductionj", form);
      setMsg(data?.message || "Deduction added ✅");
      resetCreateForm();
      // If user already searched this email, auto-refresh that list
      if (searchEmail && searchEmail.trim().toLowerCase() === form.email.trim().toLowerCase()) {
        await searchDeduction(false);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Error adding deduction");
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setForm({ email: "", deductionName: "", deductionAmount: "", colid: Number(colid) });
  };

  // -----------------
  // Read (Search by Email) with client-side pagination
  // -----------------
  const searchDeduction = async (resetPage = true) => {
    if (!searchEmail.trim()) {
      setMsg("Enter email to search");
      return;
    }
    setLoading(true);
    if (resetPage) setPage(1);
    try {
      // Optional: add a limit hint if your backend supports it
      const { data } = await ep1.get(`api/v2/getdeductionbyemailj?email=${encodeURIComponent(searchEmail.trim())}`);
      const list = normalizeList(data)
        // Prefer newest first if timestamps exist
        .sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0) - new Date(a?.updatedAt || a?.createdAt || 0));
      setResults(list);
      if (!list.length) setMsg("No deductions found for this email"); else setMsg("");
    } catch (err) {
      setResults([]);
      setMsg(err.response?.data?.message || "Error searching deductions");
    } finally {
      setLoading(false);
    }
  };

  const displayed = results.slice(0, page * pageSize);
  const canLoadMore = displayed.length < results.length;

  // -----------------
  // Update
  // -----------------
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]: name === "deductionAmount" || name === "colid" ? safeNumber(value) : value,
    }));
  };

  const updateDeduction = async () => {
    if (!updateForm) return;
    if (!updateForm.email?.trim() || !updateForm.deductionName?.trim() || updateForm.deductionAmount === "") {
      setMsg("Please fill in all fields for update");
      return;
    }
    if (Number(updateForm.deductionAmount) <= 0) {
      setMsg("Enter a valid deduction amount");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const payload = {
        id: idOf(updateForm),
        email: updateForm.email,
        deductionName: updateForm.deductionName,
        deductionAmount: Number(updateForm.deductionAmount),
        colid: Number(updateForm.colid ?? colid),
      };
      const { data } = await ep1.put("/api/v2/updatedeductionj", payload);
      setMsg(data?.message || "Deduction updated ✅");
      setUpdateForm(null);
      await searchDeduction(false); // refresh, keep current page
    } catch (err) {
      setMsg(err.response?.data?.message || "Error updating deduction");
    } finally {
      setLoading(false);
    }
  };

  // -----------------
  // Delete
  // -----------------
  const deleteDeduction = async (row) => {
    const id = idOf(row);
    if (!id) {
      setMsg("Cannot delete: missing id");
      return;
    }
    if (!window.confirm("Delete this deduction?")) return;
    setLoading(true);
    try {
      const { data } = await ep1.delete(`/api/v2/deletedeductionj?id=${encodeURIComponent(id)}`);
      setMsg(data?.message || "Deduction deleted ✅");
      await searchDeduction(false);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error deleting deduction");
    } finally {
      setLoading(false);
    }
  };

  // -----------------
  // Render
  // -----------------
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Deduction Management</h2>

      {/* Box 1: Add */}
      <div style={{ maxWidth: 1200, margin: "0 auto 20px", background: "#fff", padding: 20, borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Add Deduction</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[{ label: "Email", name: "email", type: "text" }, { label: "Deduction Name", name: "deductionName", type: "text" }, { label: "Deduction Amount", name: "deductionAmount", type: "number" }].map((f) => (
            <div key={f.name} style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name] ?? ""} onChange={handleChange} placeholder={f.label} style={{ padding: 10, border: "1px solid #ced4da", borderRadius: 6 }} />
            </div>
          ))}
        </div>
        <button onClick={saveDeduction} disabled={loading} style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#007bff", color: "#fff", fontWeight: 600 }}>{loading ? "Saving..." : "Add Deduction"}</button>
      </div>

      {/* Box 2: Search */}
      <div style={{ maxWidth: 1200, margin: "0 auto 20px", background: "#fff", padding: 20, borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Search Deductions</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="text" placeholder="Enter email to search" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} style={{ flex: 1, padding: 10, border: "1px solid #ced4da", borderRadius: 6 }} />
          <button onClick={() => searchDeduction(true)} disabled={loading} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#28a745", color: "#fff", fontWeight: 600 }}>{loading ? "Searching..." : "Search"}</button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 14 }}>
                Showing <b>{displayed.length}</b> of <b>{results.length}</b> results
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {canLoadMore && (
                  <button onClick={() => setPage((p) => p + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ced4da", background: "#fff" }}>Load more</button>
                )}
                <button onClick={() => { setResults([]); setPage(1); }} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ced4da", background: "#fff" }}>Clear</button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: 8, border: "1px solid #dee2e6" }}>Name</th>
                    <th style={{ padding: 8, border: "1px solid #dee2e6" }}>Amount</th>
                    <th style={{ padding: 8, border: "1px solid #dee2e6" }}>Email</th>
                    <th style={{ padding: 8, border: "1px solid #dee2e6" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((row) => (
                    <tr key={idOf(row)}>
                      <td style={{ padding: 8, border: "1px solid #dee2e6" }}>{row.deductionName}</td>
                      <td style={{ padding: 8, border: "1px solid #dee2e6" }}>{row.deductionAmount}</td>
                      <td style={{ padding: 8, border: "1px solid #dee2e6" }}>{row.email}</td>
                      <td style={{ padding: 8, border: "1px solid #dee2e6" }}>
                        <button onClick={() => setUpdateForm(row)} style={{ marginRight: 8, padding: "6px 12px", border: "none", background: "#ffc107", color: "#fff", borderRadius: 4 }}>Edit</button>
                        <button onClick={() => deleteDeduction(row)} style={{ padding: "6px 12px", border: "none", background: "#dc3545", color: "#fff", borderRadius: 4 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedback */}
        {msg && (
          <p style={{ marginTop: 12, textAlign: "center", color: msg.toLowerCase().includes("error") ? "#dc3545" : "#28a745", fontWeight: 600 }}>{msg}</p>
        )}
      </div>

      {/* Box 3: Update */}
      {updateForm && (
        <div style={{ maxWidth: 1200, margin: "0 auto 20px", background: "#fff", padding: 20, borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Update Deduction</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[{ label: "Email (read-only)", name: "email", type: "text", disabled: true }, { label: "Deduction Name", name: "deductionName", type: "text" }, { label: "Deduction Amount", name: "deductionAmount", type: "number" }].map((f) => (
              <div key={f.name} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
                <input name={f.name} type={f.type} value={updateForm?.[f.name] ?? ""} onChange={handleUpdateChange} disabled={f.disabled} style={{ padding: 10, border: "1px solid #ced4da", borderRadius: 6 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={updateDeduction} disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#17a2b8", color: "#fff", fontWeight: 600 }}>{loading ? "Updating..." : "Update Deduction"}</button>
            <button onClick={() => setUpdateForm(null)} style={{ padding: 12, borderRadius: 8, border: "1px solid #ced4da", background: "#fff" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}