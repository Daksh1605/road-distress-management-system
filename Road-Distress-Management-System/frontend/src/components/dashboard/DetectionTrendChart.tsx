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

type DetectionTrendItem = {
  week: string
  detections: number
}

const detectionTrendData: DetectionTrendItem[] = [
  {
    week: 'Week 1',
    detections: 120,
  },
  {
    week: 'Week 2',
    detections: 185,
  },
  {
    week: 'Week 3',
    detections: 240,
  },
  {
    week: 'Week 4',
    detections: 210,
  },
  {
    week: 'Week 5',
    detections: 295,
  },
  {
    week: 'Week 6',
    detections: 340,
  },
]

function DetectionTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={detectionTrendData}>
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
