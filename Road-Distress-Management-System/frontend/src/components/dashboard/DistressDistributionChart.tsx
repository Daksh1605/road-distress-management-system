import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

type DistressDistributionItem = {
  name: string
  value: number
  color: string
}

const distressDistributionData: DistressDistributionItem[] = [
  {
    name: 'Potholes',
    value: 35,
    color: '#38bdf8',
  },
  {
    name: 'Cracks',
    value: 28,
    color: '#22c55e',
  },
  {
    name: 'Rutting',
    value: 15,
    color: '#f97316',
  },
  {
    name: 'Edge Breaks',
    value: 12,
    color: '#ef4444',
  },
  {
    name: 'Patches',
    value: 10,
    color: '#a78bfa',
  },
]

function DistressDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={distressDistributionData}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="78%"
          paddingAngle={3}
        >
          {distressDistributionData.map((item) => (
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
