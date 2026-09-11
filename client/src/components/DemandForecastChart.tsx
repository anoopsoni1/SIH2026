import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DemandForecastChartProps {
  data: Array<{
    zone: string;
    predictedDemand: number;
    availableWorkers: number;
    workforceGap: number;
  }>;
}

export const DemandForecastChart: React.FC<DemandForecastChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="zone" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <Bar dataKey="predictedDemand" name="Predicted Demand" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="availableWorkers" name="Available Workers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="workforceGap" name="Workforce Deficit" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
