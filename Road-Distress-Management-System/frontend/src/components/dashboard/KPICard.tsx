import type { ReactNode } from 'react'

import './KPICard.css'

type KPICardStatus = 'success' | 'warning' | 'danger' | 'default'

// Props describe the display data needed for a reusable KPI summary card.
type KPICardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  status?: KPICardStatus
}

// KPICard is responsible only for presenting a single KPI value.
function KPICard({
  title,
  value,
  subtitle,
  icon,
  status = 'default',
}: KPICardProps) {
  return (
    <article className={`kpi-card kpi-card--${status}`} aria-label={title}>
      <div className="kpi-card__status" aria-hidden="true" />

      {icon && (
        <div className="kpi-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <header className="kpi-card__header">
        <h2 className="kpi-card__title">{title}</h2>
      </header>

      <p className="kpi-card__value">{value}</p>

      {subtitle && <p className="kpi-card__subtitle">{subtitle}</p>}
    </article>
  )
}

export default KPICard
