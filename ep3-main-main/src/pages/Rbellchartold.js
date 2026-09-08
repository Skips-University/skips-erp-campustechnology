import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export default function BellChart({data}){

  if(!data.length) return null;

  const bins={};

  data.forEach(d=>{
    const k=Math.floor(d.totalmarks/10)*10;
    bins[k]=(bins[k]||0)+1;
  });

  const chart=Object.keys(bins).map(k=>({
    x:Number(k), count:bins[k]
  }));

  return(
    <ComposedChart width={700} height={300} data={chart}>
      <CartesianGrid/>
      <XAxis dataKey="x"/>
      <YAxis/>
      <Tooltip/>
      <Bar dataKey="count"/>
    </ComposedChart>
  );
}