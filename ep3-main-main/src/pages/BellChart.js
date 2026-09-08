import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar
} from "recharts";

export default function BellChart({ data }) {

  const bins = [];

  for (let i = 0; i < data.length; i++) {
    const mark = Math.floor(data[i].totalmarks / 10) * 10;

    const found = bins.find(b => b.range === mark);
    if (found) found.count++;
    else bins.push({ range: mark, count: 1 });
  }

  return (
    <>
      <h3>Histogram</h3>
      <BarChart width={500} height={300} data={bins}>
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>

      <h3>Z Score Curve</h3>
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="zscore" />
        <YAxis />
        <Tooltip />
        <Line dataKey="zscore" />
      </LineChart>
    </>
  );
}