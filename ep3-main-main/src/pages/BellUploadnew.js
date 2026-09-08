import { useState } from "react";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import ep1 from '../api/ep1';
import global1 from './global1';

export default function BellUpload() {

  const [form, setForm] = useState({
    colid: global1.colid,
        student: "",
        regno: "",
        totalmarks: ""
  });

  const submit = async () => {
    await ep1.post("bell/exam/create1", form);
    alert("Saved");
  };

  return (
    <div>
      {/* <TextField label="ColID" onChange={e => setForm({...form, colid: Number(e.target.value)})}/> */}
      <TextField label="Student" onChange={e => setForm({...form, student: e.target.value})}/>
      <TextField label="Marks" onChange={e => setForm({...form, totalmarks: Number(e.target.value)})}/>
      <Button onClick={submit}>Save</Button>
    </div>
  );
}