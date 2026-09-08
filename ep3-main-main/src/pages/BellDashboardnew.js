import { useState, useEffect } from "react";
import axios from "axios";
import BellChart from "./BellChartnew";
import BellCurveControls from "./BellCurveControls";
import ep1 from '../api/ep1';
import global1 from './global1';
import { TextField, Button } from "@mui/material";

export default function BellDashboard(){

  const [colid,setColid]=useState(global1.colid);
  const [data,setData]=useState([]);
  const [config,setConfig]=useState({});

  const load=async()=>{
    const res=await ep1.post("/bell/exam/list1",{colid});
    setData(res.data);

    const cfg=await ep1.post("/bell/config/get1",{colid});
    setConfig(cfg.data || {});
  };

  const apply=async()=>{
    await ep1.post("/bell/config/save1",{...config,colid});
    await ep1.post("/bell/curve/apply1",{colid});
    load();
  };

  useEffect(()=>{
    if(!colid) return;
    const t=setTimeout(apply,500);
    return ()=>clearTimeout(t);
  },[config]);

  return (
    <div>

      {/* <input placeholder="ColID"
        onChange={e=>setColid(e.target.value)}/> */}

      <button onClick={load}>Load</button>

      <Button onClick={async () => {
  await ep1.post("/bell/config/auto1", { colid: global1.colid });
  alert("Auto bands generated");
}}>
  Auto Generate Bands
</Button>

      <BellCurveControls config={config} setConfig={setConfig}/>

      <BellChart data={data} config={config}/>

      {data.map(d=>(
        <div key={d._id}>
          {d.student} - {d.totalmarks} - {d.grade}
        </div>
      ))}

    </div>
  );
}