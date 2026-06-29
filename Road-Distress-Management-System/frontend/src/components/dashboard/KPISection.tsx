import { Navigation, Film, Activity, ShieldAlert, AlertTriangle, Cpu, Clock, FileText } from 'lucide-react'
import KPICard from './KPICard'

type KPISectionProps = {
  distressCount: number
  criticalCount: number
  pendingCount: number
  reportsCount: number
}

export default function KPISection({
  distressCount,
  criticalCount,
  pendingCount,
  reportsCount,
}: KPISectionProps) {

  const kpiItems = [
    {
      title: 'Roads Scanned',
      value: '12,450 km',
      icon: <Navigation size={18} />,
      trend: '+1.8%',
      isPositive: true,
      sparklineData: [12000, 12100, 12300, 12400, 12450],
      comparison: 'vs yesterday',
    },
    {
      title: 'Videos Uploaded',
      value: '42',
      icon: <Film size={18} />,
      trend: '+8%',
      isPositive: true,
      sparklineData: [30, 32, 35, 38, 40, 42],
      comparison: 'vs last week',
    },
    {
      title: 'Processing Queue',
      value: pendingCount || 2,
      icon: <Activity size={18} />,
      trend: '-50%',
      isPositive: true,
      sparklineData: [6, 5, 4, 3, 2, 2],
      comparison: 'vs yesterday',
    },
    {
      title: 'Total Distresses',
      value: distressCount || 87,
      icon: <ShieldAlert size={18} />,
      trend: '+3.4%',
      isPositive: false,
      sparklineData: [75, 78, 80, 84, 87],
      comparison: 'vs yesterday',
    },
    {
      title: 'Critical Distresses',
      value: criticalCount || 12,
      icon: <AlertTriangle size={18} />,
      trend: '+0%',
      isPositive: true,
      sparklineData: [12, 12, 12, 12, 12],
      comparison: 'vs yesterday',
    },
    {
      title: 'YOLO Accuracy',
      value: '94.2%',
      icon: <Cpu size={18} />,
      trend: '+0.4%',
      isPositive: true,
      sparklineData: [93.5, 93.8, 94.0, 94.1, 94.2],
      comparison: 'vs last model build',
    },
    {
      title: 'Avg Processing Time',
      value: '1.8 min',
      icon: <Clock size={18} />,
      trend: '-14%',
      isPositive: true,
      sparklineData: [2.1, 2.0, 1.9, 1.8, 1.8],
      comparison: 'vs yesterday',
    },
    {
      title: 'Reports Generated',
      value: reportsCount || 18,
      icon: <FileText size={18} />,
      trend: '+12%',
      isPositive: true,
      sparklineData: [12, 14, 15, 17, 18],
      comparison: 'vs yesterday',
    },
  ]

  return (
    <section>
      <div
        style={{
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {kpiItems.map((item) => (
          <KPICard 
            key={item.title} 
            title={item.title} 
            value={item.value} 
            icon={item.icon}
            trend={item.trend}
            isPositive={item.isPositive}
            sparklineData={item.sparklineData}
            comparison={item.comparison}
          />
        ))}
      </div>
    </section>
  )
}
