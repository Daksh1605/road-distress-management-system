import type { ReactNode } from 'react'
import './KPICard.css'

type KPICardProps = {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  isPositive?: boolean
  comparison?: string
  sparklineData?: number[]
}

export default function KPICard({
  title,
  value,
  icon,
  trend = '+4.2%',
  isPositive = true,
  comparison = 'vs yesterday',
  sparklineData = [35, 45, 40, 55, 50, 65, 60],
}: KPICardProps) {
  
  // Calculate SVG sparkline points
  const points = sparklineData
    .map((val, index) => {
      const x = (index / (sparklineData.length - 1)) * 70;
      const y = 30 - ((val - Math.min(...sparklineData)) / (Math.max(...sparklineData) - Math.min(...sparklineData) || 1)) * 25;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <article className="premium-kpi-card premium-card animate-fade-in" aria-label={title}>
      <div className="kpi-card-inner">
        <div className="kpi-card-inner__left">
          <span className="small-caption font-bold kpi-title-label">{title}</span>
          <p className="large-kpi-number kpi-value-num">{value}</p>
        </div>
        <div className="kpi-card-inner__right">
          <div className="kpi-icon-container">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="kpi-card-footer">
        <div className="kpi-sparkline" aria-hidden="true">
          <svg width="70" height="30">
            <polyline
              fill="none"
              stroke={isPositive ? 'var(--success)' : 'var(--danger)'}
              strokeWidth="2"
              points={points}
            />
          </svg>
        </div>
        <div className="kpi-trend-group">
          <span className={`trend-badge ${isPositive ? 'trend-badge--positive' : 'trend-badge--negative'}`}>
            {trend}
          </span>
          <span className="comparison-lbl">{comparison}</span>
        </div>
      </div>
    </article>
  )
}
