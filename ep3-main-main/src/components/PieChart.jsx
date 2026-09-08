import { PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PieChart({ title, data, x, y }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePie>
        <Pie
          data={data}
          dataKey={y}
          nameKey={x}
          cx="50%"
          cy="45%"
          outerRadius={90}
          label
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </RePie>
    </ResponsiveContainer>
  );
}