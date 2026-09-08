import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceArea
} from "recharts";

export default function BellChart({ data, config }) {

  if (!data || data.length === 0) return null;

  const COLORS = {
    histogram: "#42a5f5",
    curve: "#ef5350",
    grid: "#e0e0e0",
    text: "#555"
  };

  const marks = data.map(d =>
    config?.useNormalization && d.normalized
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

  // Histogram
  const bins = {};
  marks.forEach(m=>{
    const k = Math.floor(m/10)*10;
    bins[k] = (bins[k] || 0) + 1;
  });

  const hist = Object.keys(bins).map(k=>({
    x:Number(k), count:bins[k]
  }));

  // Curve
  const min = Math.min(...marks);
  const max = Math.max(...marks);
  const step = (max-min)/60;

  const curve=[];
  for(let x=min;x<=max;x+=step){
    curve.push({
      x,
      curve: gaussian(x)*marks.length*10
    });
  }

  const merged = hist.map(h=>{
    const c = curve.find(p=>Math.abs(p.x-h.x)<step);
    return {...h, curve: c ? c.curve : 0};
  });

  // 🎨 Grade Zone Colors
  const zoneColors = {
    O:"#4caf50",
    "A+":"#8bc34a",
    A:"#cddc39",
    "B+":"#ffeb3b",
    B:"#ffc107",
    C:"#ff9800",
    P:"#ff5722",
    F:"#f44336"
  };

  const zones = config?.grades?.map(g=>({
    from: mean + g.minZ*stdDev,
    to: mean + g.maxZ*stdDev,
    grade: g.grade
  }));

  return (
    <div style={{ background:"#fff", padding:20, borderRadius:10 }}>

      <h3 style={{ color:"#333" }}>Bell Curve Distribution</h3>

      <ComposedChart width={800} height={400} data={merged}>
        
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />

        <XAxis
          dataKey="x"
          stroke={COLORS.text}
          tick={{ fill: COLORS.text }}
        />

        <YAxis
          stroke={COLORS.text}
          tick={{ fill: COLORS.text }}
        />

        <Tooltip />

        {/* 🎨 Grade Zones */}
        {zones?.map((z,i)=>(
          <ReferenceArea
            key={i}
            x1={z.from}
            x2={z.to}
            fill={zoneColors[z.grade] || "#ccc"}
            fillOpacity={0.15}
          />
        ))}

        {/* 📊 Histogram */}
        <Bar
          dataKey="count"
          fill={COLORS.histogram}
          radius={[5,5,0,0]}
        />

        {/* 📈 Curve */}
        <Line
          type="monotone"
          dataKey="curve"
          stroke={COLORS.curve}
          strokeWidth={3}
          dot={false}
        />

      </ComposedChart>
    </div>
  );
}