import KPICard from './KPICard'

type KPIItem = {
  title: string
  value: string | number
}

const kpiItems: KPIItem[] = [
  {
    title: 'Roads Monitored',
    value: '12,450 km',
  },
  {
    title: 'Distresses Detected',
    value: '1,286',
  },
  {
    title: 'Critical Distresses',
    value: '184',
  },
  {
    title: 'Pending Repairs',
    value: '72',
  },
  {
    title: 'Videos Analyzed',
    value: '542',
  },
  {
    title: 'Model Accuracy',
    value: '96.4%',
  },
]

function KPISection() {
  return (
    <section>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {kpiItems.map((item) => (
          <KPICard key={item.title} title={item.title} value={item.value} />
        ))}
      </div>
    </section>
  )
}

export default KPISection
