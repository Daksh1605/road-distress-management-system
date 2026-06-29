import { Activity, Wrench } from 'lucide-react';
import type { RepairProgressItem } from '../../types/maintenance';
import './RepairProgressTracker.css';

interface RepairProgressTrackerProps {
  items: RepairProgressItem[];
}

export default function RepairProgressTracker({ items }: RepairProgressTrackerProps) {
  const sortedItems = [...items].sort((a, b) => b.progress - a.progress);

  return (
    <section className="mnt-progress" aria-labelledby="mnt-progress-title">
      <header className="mnt-progress__header">
        <div className="mnt-progress__header-group">
          <Activity size={16} className="mnt-progress__header-icon" />
          <h2 id="mnt-progress-title" className="mnt-progress__title">Repair Progress Tracker</h2>
        </div>
        <span className="mnt-progress__badge font-mono">
          {items.filter((i) => i.status === 'In Progress').length} active
        </span>
      </header>

      <div className="mnt-progress__body">
        <div className="mnt-progress__grid">
          {sortedItems.map((item) => (
            <article key={item.orderId} className="mnt-progress__card">
              <div className="mnt-progress__card-top">
                <div>
                  <span className="mnt-progress__order-id font-mono">{item.orderId}</span>
                  <h3 className="mnt-progress__road">
                    <span className="font-mono">{item.roadId}</span>
                    — {item.distressType}
                  </h3>
                </div>
                <span className={`mnt-progress__status mnt-progress__status--${item.status.replace(/\s/g, '-').toLowerCase()}`}>
                  <Wrench size={12} />
                  {item.status}
                </span>
              </div>

              <p className="mnt-progress__location">{item.location}</p>
              <p className="mnt-progress__team">Team: {item.team}</p>

              <div className="mnt-progress__bar-section">
                <div className="mnt-progress__bar-header">
                  <span>Progress</span>
                  <span className="font-mono mnt-progress__percent">{item.progress}%</span>
                </div>
                <div className="mnt-progress__bar-track">
                  <div
                    className={`mnt-progress__bar-fill ${item.progress >= 80 ? 'mnt-progress__bar-fill--high' : ''}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <div className="mnt-progress__times">
                <div className="mnt-progress__time">
                  <span className="mnt-progress__time-label">Started</span>
                  <span className="font-mono">{item.startedAt}</span>
                </div>
                <div className="mnt-progress__time">
                  <span className="mnt-progress__time-label">Est. Completion</span>
                  <span className="font-mono">{item.estimatedCompletion}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
