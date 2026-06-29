import { useMemo } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { RoadDistressResponse } from '../../services/api/apiService'

type DistressDistributionItem = {
  name: string
  value: number
  color: string
}

export interface DistressDistributionChartProps {
  data: RoadDistressResponse[]
}

const COLORS = ['#38bdf8', '#22c55e', '#f97316', '#ef4444', '#a78bfa'];

function DistressDistributionChart({ data }: DistressDistributionChartProps) {
  const chartData = useMemo((): DistressDistributionItem[] => {
    // Dynamic grouping based on distress_type strings
    const counts: Record<string, number> = {
      'Potholes': 0,
      'Cracks': 0,
      'Rutting': 0,
      'Edge Breaks': 0,
      'Patches': 0
    };

    data.forEach((item) => {
      const type = item.distress_type.toLowerCase();
      if (type.includes('pothole')) {
        counts['Potholes']++;
      } else if (type.includes('crack') || type.includes('alligator')) {
        counts['Cracks']++;
      } else if (type.includes('rut')) {
        counts['Rutting']++;
      } else if (type.includes('edge')) {
        counts['Edge Breaks']++;
      } else {
        counts['Patches']++;
      }
    });

    const items: DistressDistributionItem[] = [
      { name: 'Potholes', value: counts['Potholes'], color: COLORS[0] },
      { name: 'Cracks', value: counts['Cracks'], color: COLORS[1] },
      { name: 'Rutting', value: counts['Rutting'], color: COLORS[2] },
      { name: 'Edge Breaks', value: counts['Edge Breaks'], color: COLORS[3] },
      { name: 'Patches', value: counts['Patches'], color: COLORS[4] }
    ];

    // Filter out categories with zero detections to avoid rendering empty slices,
    // but if all are zero, provide default stubs so Recharts doesn't throw.
    const activeItems = items.filter(item => item.value > 0);
    return activeItems.length > 0 ? activeItems : [
      { name: 'Potholes', value: 0, color: COLORS[0] },
      { name: 'Cracks', value: 0, color: COLORS[1] },
      { name: 'Rutting', value: 0, color: COLORS[2] },
      { name: 'Edge Breaks', value: 0, color: COLORS[3] },
      { name: 'Patches', value: 0, color: COLORS[4] }
    ];
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="78%"
          paddingAngle={3}
        >
          {chartData.map((item) => (
            <Cell key={item.name} fill={item.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid rgba(148, 163, 184, 0.24)',
            borderRadius: '10px',
            color: '#f8fafc',
          }}
          itemStyle={{ color: '#f8fafc' }}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default DistressDistributionChart
