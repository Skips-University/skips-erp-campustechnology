import React from 'react';
import { BarChart as ReBar, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChart({ title, data, x, y }) {
  return (
    <>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ReBar data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis dataKey={x} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={y} fill="#1976d2" />
        </ReBar>
      </ResponsiveContainer>
    </>
  );
}