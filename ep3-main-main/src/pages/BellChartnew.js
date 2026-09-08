import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceArea
} from "recharts";

export default function BellChart({ data, config }) {

  if (!data.length) return null;

  const marks = data.map(d =>
    config.useNormalization && d.normalized
      ? d.normalized
      : d.totalmarks
  );

  const mean = marks.reduce((a,b)=>a+b,0)/marks.length;

  const variance = marks.reduce((s,m)=>
    s + Math.pow(m-mean,2),0)/marks.length;

  const stdDev = Math.sqrt(variance);

  const gaussian = x =>
    (1/(stdDev*Math.sqrt(2*Math.PI))) *
    Math.exp(-Math.pow(x-mean,2)/(2*stdDev*stdDev));

  const bins = {};
  marks.forEach(m=>{
    const k=Math.floor(m/10)*10;
    bins[k]=(bins[k]||0)+1;
  });

  const hist = Object.keys(bins).map(k=>({
    x:Number(k), count:bins[k]
  }));

  const min=Math.min(...marks);
  const max=Math.max(...marks);
  const step=(max-min)/60;

  const curve=[];
  for(let x=min;x<=max;x+=step){
    curve.push({x, curve: gaussian(x)*marks.length*10});
  }

  const merged = hist.map(h=>{
    const c=curve.find(p=>Math.abs(p.x-h.x)<step);
    return {...h, curve:c?c.curve:0};
  });

  const zones = config.grades?.map(g=>({
    from: mean + g.minZ*stdDev,
    to: mean + g.maxZ*stdDev,
    grade: g.grade
  }));

  const colors = {
    O:"#4caf50", A:"#cddc39", "A+":"#8bc34a",
    "B+":"#ffeb3b", B:"#ffc107",
    C:"#ff9800", P:"#ff5722", F:"#f44336"
  };

  return (
    <ComposedChart width={800} height={400} data={merged}>
      <CartesianGrid/>
      <XAxis dataKey="x"/>
      <YAxis/>
      <Tooltip/>

      {zones?.map((z,i)=>(
        <ReferenceArea key={i}
          x1={z.from} x2={z.to}
          fill={colors[z.grade]}
          fillOpacity={0.2}/>
      ))}

      <Bar dataKey="count"/>
      <Line dataKey="curve" dot={false}/>
    </ComposedChart>
  );
}