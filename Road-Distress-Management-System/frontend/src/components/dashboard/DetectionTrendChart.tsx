import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RoadDistressResponse } from '../../services/api/apiService'

type DetectionTrendItem = {
  week: string
  detections: number
}

export interface DetectionTrendChartProps {
  data: RoadDistressResponse[]
}

function DetectionTrendChart({ data }: DetectionTrendChartProps) {
  const trendData = useMemo((): DetectionTrendItem[] => {
    const counts: Record<string, number> = {};
    
    data.forEach((item) => {
      // Extract YYYY-MM-DD from timestamp
      const dateStr = item.detected_at.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    const sortedDates = Object.keys(counts).sort();
    const mapped = sortedDates.map((date) => ({
      week: date,
      detections: counts[date]
    }));

    return mapped.length > 0 ? mapped : [
      { week: 'No Data', detections: 0 }
    ];
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={trendData}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="4 4" />
        <XAxis dataKey="week" stroke="#94a3b8" tickLine={false} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
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
        <Legend />
        <Line
          type="monotone"
          dataKey="detections"
          name="Detections"
          stroke="#38bdf8"
          strokeWidth={3}
          dot={{ fill: '#38bdf8', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default DetectionTrendChart
