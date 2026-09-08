import { useState } from "react";
import axios from "axios";
import global1 from "./global1";
import ep1 from '../api/ep1';

export default function BellUpload(){

  const [form,setForm]=useState({});

  const save=async()=>{
    await ep1.post("/rbell/exam/create",{
      ...form,
      colid: global1.colid
    });
    alert("Saved");
  };

  return(
    <div>
      <input placeholder="Student"
        onChange={e=>setForm({...form,student:e.target.value})}/>

      <input placeholder="Marks"
        onChange={e=>setForm({...form,totalmarks:+e.target.value})}/>

      <button onClick={save}>Save</button>
    </div>
  );
}