import { useState } from "react";
import axios from "axios";
import BellChart from "./Rbellchart";
import global1 from "./global1";
import ep1 from '../api/ep1';

export default function BellDashboard(){

  const [data,setData]=useState([]);

  const colid = global1.colid;

  const load=async()=>{
    const res=await ep1.post("/bell/exam/list",{colid});
    setData(res.data);
  };

  const apply=async()=>{
    await ep1.post("/bell/curve/apply",{colid});
    load();
  };

  return(
    <div>

      <h3>Bell chart analysis</h3>

      <button onClick={load}>Load</button>
      <button onClick={apply}>Apply</button>

      <BellChart data={data}/>

      {data.map(d=>(
        <div key={d._id}>
          {d.student} - {d.totalmarks} - {d.grade}
          {d.percentile ? ` (${d.percentile.toFixed(1)}%)` : ""}
        </div>
      ))}

    </div>
  );
}