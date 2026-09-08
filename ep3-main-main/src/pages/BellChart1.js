import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function BellChart({ data }) {

  if (!data || data.length === 0) return <div>No data</div>;

  // Extract marks
  const marks = data.map(d => d.totalmarks);

  // Mean
  const mean = marks.reduce((a, b) => a + b, 0) / marks.length;

  // Std Dev
  const variance = marks.reduce((sum, m) =>
    sum + Math.pow(m - mean, 2), 0) / marks.length;

  const stdDev = Math.sqrt(variance);

  // Histogram bins (10-mark range)
  const bins = {};
  marks.forEach(m => {
    const key = Math.floor(m / 10) * 10;
    bins[key] = (bins[key] || 0) + 1;
  });

  const histogram = Object.keys(bins).map(k => ({
    x: Number(k),
    count: bins[k]
  }));

  // Gaussian function
  const gaussian = (x) => {
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-Math.pow(x - mean, 2) / (2 * stdDev * stdDev));
  };

  // Generate smooth curve points
  const min = Math.min(...marks);
  const max = Math.max(...marks);

  const curvePoints = [];
  const step = (max - min) / 50; // smoothness

  let maxHist = Math.max(...histogram.map(h => h.count));

  for (let x = min; x <= max; x += step) {
    curvePoints.push({
      x,
      curve: gaussian(x) * marks.length * 10 // scale to histogram
    });
  }

  // Merge histogram + curve
  const merged = histogram.map(h => {
    const closest = curvePoints.find(c => Math.abs(c.x - h.x) < step);
    return {
      x: h.x,
      count: h.count,
      curve: closest ? closest.curve : 0
    };
  });

  return (
    <div>
      <h3>Bell Curve Distribution</h3>

      <ComposedChart width={700} height={400} data={merged}>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="count" />
        <Line dataKey="curve" dot={false} />
      </ComposedChart>
    </div>
  );
}